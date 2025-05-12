const User = require('../models/User');

/**
 * GET   /api/users/:userId/courses
 * POST  /api/users/:userId/courses
 */
exports.getCourses = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId, 'courses');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user.courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { title, lecturer } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.courses.push({ title, lecturer, lectures: [] });
    await user.save();

    // return the newly created subdoc
    const newCourse = user.courses[user.courses.length - 1];
    res.status(201).json(newCourse);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET    /api/users/:userId/courses/:courseId
 * PUT    /api/users/:userId/courses/:courseId
 * DELETE /api/users/:userId/courses/:courseId
 */
exports.getCourse = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId, 'courses');
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const course = user.courses.id(req.params.courseId);
    if (!course) return res.status(404).json({ msg: 'Course not found' });

    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { title, lecturer } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const course = user.courses.id(req.params.courseId);
    if (!course) return res.status(404).json({ msg: 'Course not found' });

    if (title) course.title = title;
    if (lecturer) course.lecturer = lecturer;
    await user.save();

    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const course = user.courses.id(req.params.courseId);
    if (!course) return res.status(404).json({ msg: 'Course not found' });

    course.remove();
    await user.save();
    res.json({ msg: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
