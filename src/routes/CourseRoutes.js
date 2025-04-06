const express = require('express');
const router = express.Router();
const courseController = require('../controllers/CourseController');

router.post('/create', courseController.createCourse);
router.get('/:userId', courseController.getCoursesByUser);

module.exports = router;
