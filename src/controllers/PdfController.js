const PDF = require('../models/pdf');

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
