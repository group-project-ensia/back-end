const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  pdf: { type: mongoose.Schema.Types.ObjectId, ref: 'PDF', required: true },
  summary: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Resume', resumeSchema);