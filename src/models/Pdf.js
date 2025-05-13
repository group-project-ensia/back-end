const mongoose = require('mongoose');

const pdfSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Added title field
  filename: String,
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  url: String, // if hosted or stored
  content: String, // Store the PDF text content
  summary: String, // Store the AI-generated summary
}, { timestamps: true });

module.exports = mongoose.model('PDF', pdfSchema);
