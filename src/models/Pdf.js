const mongoose = require('mongoose');

const pdfSchema = new mongoose.Schema({
  filename: String,
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  url: String, // if hosted or stored
}, { timestamps: true });

module.exports = mongoose.model('PDF', pdfSchema);
