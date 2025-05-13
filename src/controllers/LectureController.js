// controllers/LectureController.js
const User = require('../models/User');
const Groq = require('groq-sdk');
const pdfParse = require('pdf-parse');
const fs = require('fs').promises;
const path = require('path');

const groq = new Groq({
  apiKey: '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' // Replace with your new API key
});

exports.getLectures = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId, 'courses');
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const course = user.courses.id(req.params.courseId);
    if (!course) return res.status(404).json({ msg: 'Course not found' });

    res.json(course.lectures);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createLecture = async (req, res) => {
  try {
    const { title, summary, flashcards } = req.body;
    // multer has placed the uploaded file info on req.file
    if (!req.file) return res.status(400).json({ msg: 'PDF file is required' });

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const course = user.courses.id(req.params.courseId);
    if (!course) return res.status(404).json({ msg: 'Course not found' });

    // push a new lecture subdocument, storing the file path
    course.lectures.push({
      title,
      pdf: req.file.path,       // <— store server path to PDF
      summary: summary || '',
      flashcards: flashcards || [],
      chats: []
    });

    await user.save();
    const newLecture = course.lectures[course.lectures.length - 1];
    res.status(201).json(newLecture);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLecture = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId, 'courses');
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const course = user.courses.id(req.params.courseId);
    if (!course) return res.status(404).json({ msg: 'Course not found' });

    const lecture = course.lectures.id(req.params.lectureId);
    if (!lecture) return res.status(404).json({ msg: 'Lecture not found' });

    res.json(lecture);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateLecture = async (req, res) => {
  try {
    const { title, summary, flashcards } = req.body;
    const filePath = req.file?.path;    // multer may have given us a new PDF

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const course = user.courses.id(req.params.courseId);
    if (!course) return res.status(404).json({ msg: 'Course not found' });

    const lecture = course.lectures.id(req.params.lectureId);
    if (!lecture) return res.status(404).json({ msg: 'Lecture not found' });

    // update fields if provided
    if (title)   lecture.title   = title;
    if (filePath) lecture.pdf    = filePath;
    if (summary !== undefined) lecture.summary = summary;
    if (flashcards) lecture.flashcards = flashcards;

    await user.save();
    res.json(lecture);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteLecture = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const course = user.courses.id(req.params.courseId);
    if (!course) return res.status(404).json({ msg: 'Course not found' });

    const lecture = course.lectures.id(req.params.lectureId);
    if (!lecture) return res.status(404).json({ msg: 'Lecture not found' });

    lecture.remove();
    await user.save();
    res.json({ msg: 'Lecture deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Summarize Lecture PDF
exports.summarizeLecture = async (req, res) => {
  try {
    console.log('Received summarize request for lecture ID:', req.params.lectureId);
    
    // Find the user -> course -> lecture
    const user = await User.findById(req.params.userId);
    if (!user) {
      console.log('User not found with ID:', req.params.userId);
      return res.status(404).json({ error: 'User not found' });
    }

    const course = user.courses.id(req.params.courseId);
    if (!course) {
      console.log('Course not found with ID:', req.params.courseId);
      return res.status(404).json({ error: 'Course not found' });
    }

    const lecture = course.lectures.id(req.params.lectureId);
    if (!lecture) {
      console.log('Lecture not found with ID:', req.params.lectureId);
      return res.status(404).json({ error: 'Lecture not found' });
    }

    console.log('Found lecture:', lecture.title);
    console.log('PDF path:', lecture.pdf);

    // Get PDF file path
    let pdfPath = lecture.pdf;
    
    // If the path is relative, make it absolute
    if (!path.isAbsolute(pdfPath)) {
      pdfPath = path.join(__dirname, '..', lecture.pdf);
    }

    console.log('Reading PDF from:', pdfPath);
    
    try {
      // Read PDF file
      const pdfBuffer = await fs.readFile(pdfPath);
      const pdfData = await pdfParse(pdfBuffer);
      const pdfContent = pdfData.text;

      if (!pdfContent) {
        console.log('No content extracted from PDF:', lecture.title);
        return res.status(400).json({ error: 'Could not extract content from PDF' });
      }

      // Step 1: Generate a short summary for context field (< 100 words)
      console.log('Generating short summary for context field');
      const contextSummaryCompletion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that creates very concise summaries of academic documents. Provide a brief, clear summary in less than 100 words that captures the essential points."
          },
          {
            role: "user",
            content: `Please summarize this PDF content in less than 100 words: ${pdfContent}`
          }
        ],
      });
      
      const contextSummary = contextSummaryCompletion.choices[0]?.message?.content;
      if (!contextSummary) {
        console.log('No context summary received from Groq API');
        return res.status(500).json({ error: 'Failed to generate context summary' });
      }
      
      // Store the short summary in the context field
      lecture.context = contextSummary;
      console.log('Short summary saved to context field');

      // Step 2: Generate detailed summary for summary field (no size limitation)
      console.log('Generating detailed summary for summary field');
      const summaryCompletion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant that summarizes academic PDF documents using proper LaTeX formatting. 
Create a comprehensive and detailed summary that follows these guidelines:

1. Use proper LaTeX document structure with \\section{}, \\subsection{}, and other LaTeX environments
2. Start with a \\section{Summary} heading
3. Format lists using proper LaTeX itemize or enumerate environments
4. Use proper LaTeX math formatting with $ or $$ delimiters for inline and display math
5. DO NOT use Markdown-style formatting like **bold** or * for lists
6. Structure the document with clear sections for Introduction, Key Concepts, and Conclusions
7. If mathematical equations are present, use proper LaTeX notation
8. DO NOT include \\documentclass or \\begin{document} tags - just the content
9. Provide a detailed and comprehensive summary without size limitations`
          },
          {
            role: "user",
            content: `Please provide a detailed and comprehensive summary of this PDF content using proper LaTeX formatting as specified: ${pdfContent}`
          }
        ],
      });

      const summary = summaryCompletion.choices[0]?.message?.content;
      if (!summary) {
        console.log('No summary received from Groq API');
        return res.status(500).json({ error: 'Failed to generate summary' });
      }

      // Store the detailed summary in the summary field
      lecture.summary = summary;
      await user.save();
      console.log('Both summaries generated and saved successfully');
      
      // Return both summaries to the frontend
      res.json({ 
        contextSummary, 
        summary
      });
    } catch (err) {
      console.error('Error processing PDF file:', err);
      return res.status(500).json({ error: 'Error processing PDF file: ' + err.message });
    }
  } catch (err) {
    console.error('Summarization error:', err);
    res.status(500).json({ error: err.message || 'Failed to summarize PDF' });
  }
};




// Get Lecture Context (short summary)
exports.getLectureContext = async (req, res) => {
  try {
    const { userId, courseId, lectureId } = req.params;
    console.log(`Fetching context for lecture ID: ${lectureId}`);

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      console.log(`User not found with ID: ${userId}`);
      return res.status(404).json({ error: 'User not found' });
    }

    // Find the course
    const course = user.courses.id(courseId);
    if (!course) {
      console.log(`Course not found with ID: ${courseId}`);
      return res.status(404).json({ error: 'Course not found' });
    }

    // Find the lecture
    const lecture = course.lectures.id(lectureId);
    if (!lecture) {
      console.log(`Lecture not found with ID: ${lectureId}`);
      return res.status(404).json({ error: 'Lecture not found' });
    }

    // Return the context field
    console.log(`Returning context for lecture: ${lecture.title}`);
    res.json({ context: lecture.context });

  } catch (err) {
    console.error('Error fetching lecture context:', err);
    res.status(500).json({ error: 'Failed to fetch lecture context' });
  }
};
