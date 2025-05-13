const PDF = require('../models/Pdf');
const Groq = require('groq-sdk');
const pdfParse = require('pdf-parse');
const fs = require('fs').promises;
const path = require('path');

const groq = new Groq({
  apiKey: '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'
});

// Create
exports.createPDF = async (req, res) => {
  try {
    const { title, filename, courseId, url } = req.body;
    const pdf = await PDF.create({ title, filename, courseId, url });
    res.status(201).json(pdf);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Read All
exports.getPDFs = async (req, res) => {
  try {
    const pdfs = await PDF.find().populate('courseId');
    res.json(pdfs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read One
exports.getPDF = async (req, res) => {
  try {
    const pdf = await PDF.findById(req.params.id).populate('courseId');
    if (!pdf) return res.status(404).json({ error: 'PDF not found' });
    res.json(pdf);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
exports.updatePDF = async (req, res) => {
  try {
    const { title, filename, courseId, url } = req.body;
    const pdf = await PDF.findByIdAndUpdate(
      req.params.id,
      { title, filename, courseId, url },
      { new: true, runValidators: true }
    );
    res.json(pdf);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete
exports.deletePDF = async (req, res) => {
  try {
    await PDF.findByIdAndDelete(req.params.id);
    res.json({ message: 'PDF deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all PDFs for a specific course
exports.getPDFsByCourse = async (req, res) => {
  try {
    const pdfs = await PDF.find({ courseId: req.params.courseId }).populate('courseId');
    res.json(pdfs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Search PDFs by title
exports.searchPDFsByTitle = async (req, res) => {
  try {
    const titleQuery = req.query.title;
    const pdfs = await PDF.find({ title: { $regex: titleQuery, $options: 'i' } });
    res.json(pdfs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Summarize PDF
exports.summarizePDF = async (req, res) => {
  try {
    console.log('Received summarize request for PDF ID:', req.params.id);
    
    const pdf = await PDF.findById(req.params.id);
    if (!pdf) {
      console.log('PDF not found with ID:', req.params.id);
      return res.status(404).json({ error: 'PDF not found' });
    }

    console.log('Found PDF:', pdf.title);

    // Get PDF file path
    const pdfPath = path.join(__dirname, '../uploads/pdfs', pdf.filename);
    console.log('Reading PDF from:', pdfPath);
    
    try {
      // Read PDF file
      const pdfBuffer = await fs.readFile(pdfPath);
      const pdfData = await pdfParse(pdfBuffer);
      const pdfContent = pdfData.text;

      if (!pdfContent) {
        console.log('No content extracted from PDF:', pdf.title);
        return res.status(400).json({ error: 'Could not extract content from PDF' });
      }

      console.log('Sending content to Groq API for summarization');
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that summarizes PDF documents. Provide a concise summary of the main points."
          },
          {
            role: "user",
            content: `Please summarize this PDF content: ${pdfContent}`
          }
        ],
      });

      const summary = completion.choices[0]?.message?.content;
      if (!summary) {
        console.log('No summary received from Groq API');
        return res.status(500).json({ error: 'Failed to generate summary' });
      }

      console.log('Successfully generated summary');
      
      // Update PDF with summary
      pdf.summary = summary;
      await pdf.save();

      res.json({ summary });
    } catch (err) {
      console.error('Error processing PDF file:', err);
      return res.status(500).json({ error: 'Error processing PDF file' });
    }
  } catch (err) {
    console.error('Summarization error:', err);
    res.status(500).json({ error: err.message || 'Failed to summarize PDF' });
  }
};

