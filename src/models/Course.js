const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pdfs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PDF' }]
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
