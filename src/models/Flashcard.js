const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  pdfId: { type: mongoose.Schema.Types.ObjectId, ref: 'PDF', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Flashcard', flashcardSchema);
