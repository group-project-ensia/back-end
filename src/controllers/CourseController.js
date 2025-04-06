const Course = require('../models/Course.js');

exports.createCourse = async (req, res) => {
  try {
    const { title, userId } = req.body;
    const course = await Course.create({ title, user: userId });
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCoursesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const courses = await Course.find({ user: userId });
    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
