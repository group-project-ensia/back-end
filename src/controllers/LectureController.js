// controllers/LectureController.js
const User = require('../models/User');

exports.getLectures = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId, 'courses');
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const course = user.courses.id(req.params.courseId);
    if (!course) return res.status(404).json({ msg: 'Course not found' });

    res.json(course.lectures);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createLecture = async (req, res) => {
  try {
    const { title, summary, flashcards } = req.body;
    // multer has placed the uploaded file info on req.file
    if (!req.file) return res.status(400).json({ msg: 'PDF file is required' });

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const course = user.courses.id(req.params.courseId);
    if (!course) return res.status(404).json({ msg: 'Course not found' });

    // push a new lecture subdocument, storing the file path
    course.lectures.push({
      title,
      pdf: req.file.path,       // <— store server path to PDF
      summary: summary || '',
      flashcards: flashcards || [],
      chats: []
    });

    await user.save();
    const newLecture = course.lectures[course.lectures.length - 1];
    res.status(201).json(newLecture);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLecture = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId, 'courses');
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const course = user.courses.id(req.params.courseId);
    if (!course) return res.status(404).json({ msg: 'Course not found' });

    const lecture = course.lectures.id(req.params.lectureId);
    if (!lecture) return res.status(404).json({ msg: 'Lecture not found' });

    res.json(lecture);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateLecture = async (req, res) => {
  try {
    const { title, summary, flashcards } = req.body;
    const filePath = req.file?.path;    // multer may have given us a new PDF

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const course = user.courses.id(req.params.courseId);
    if (!course) return res.status(404).json({ msg: 'Course not found' });

    const lecture = course.lectures.id(req.params.lectureId);
    if (!lecture) return res.status(404).json({ msg: 'Lecture not found' });

    // update fields if provided
    if (title)   lecture.title   = title;
    if (filePath) lecture.pdf    = filePath;
    if (summary !== undefined) lecture.summary = summary;
    if (flashcards) lecture.flashcards = flashcards;

    await user.save();
    res.json(lecture);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteLecture = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const course = user.courses.id(req.params.courseId);
    if (!course) return res.status(404).json({ msg: 'Course not found' });

    const lecture = course.lectures.id(req.params.lectureId);
    if (!lecture) return res.status(404).json({ msg: 'Lecture not found' });

    lecture.remove();
    await user.save();
    res.json({ msg: 'Lecture deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
