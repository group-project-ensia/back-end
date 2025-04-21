const Flashcard = require('../models/Flashcard');
const File = require('../models/File');
const PDF = require('../models/Pdf');
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.generateFlashcardsFromPDF = async (req, res) => {
  try {
    const { pdfId, fileId } = req.body;
    if (!pdfId || !fileId) return res.status(400).json({ error: 'pdfId and fileId are required' });

    const file = await File.findById(fileId);
    if (!file || !file.content) return res.status(404).json({ error: 'PDF content not found' });

    const prompt = `
You are an academic assistant. From the following lecture content, generate 5 useful flashcards in the format: 
Q: [question]
A: [answer]

Content:
${file.content}
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const flashcardText = completion.choices[0].message.content;

    const flashcards = flashcardText
      .split('\n')
      .reduce((acc, line, idx, arr) => {
        if (line.startsWith('Q:')) {
          const question = line.replace('Q: ', '').trim();
          const answerLine = arr[idx + 1] || '';
          if (answerLine.startsWith('A:')) {
            const answer = answerLine.replace('A: ', '').trim();
            acc.push({ question, answer });
          }
        }
        return acc;
      }, []);

    const savedFlashcards = await Promise.all(
      flashcards.map(fc => Flashcard.create({ ...fc, pdfId }))
    );

    res.status(201).json(savedFlashcards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate flashcards' });
  }
};
