const Course = require('../models/Course');

// Create
exports.createCourse = async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Read All
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate('userId');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read One
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('userId pdfs');
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(course);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete
exports.deleteCourse = async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Search Courses by title
exports.searchCoursesByTitle = async (req, res) => {
  try {
    const titleQuery = req.query.title;
    const courses = await Course.find({ title: { $regex: titleQuery, $options: 'i' } });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
