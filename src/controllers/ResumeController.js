const Resume = require('../models/resume');

// Create
exports.createResume = async (req, res) => {
  try {
    const resume = await Resume.create(req.body);
    res.status(201).json(resume);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Read All
exports.getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find().populate('pdfId userId');
    res.json(resumes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read One
exports.getResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id).populate('pdfId userId');
    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    res.json(resume);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
exports.updateResume = async (req, res) => {
  try {
    const resume = await Resume.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(resume);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete
exports.deleteResume = async (req, res) => {
  try {
    await Resume.findByIdAndDelete(req.params.id);
    res.json({ message: 'Resume deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
