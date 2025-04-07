const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  pdfId: { type: mongoose.Schema.Types.ObjectId, ref: 'PDF' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: String
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
