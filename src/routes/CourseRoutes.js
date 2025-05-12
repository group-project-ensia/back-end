const express       = require('express');
const router        = express.Router({ mergeParams: true });
const courseCtrl    = require('../controllers/CourseController');
const lectureRoutes = require('./LectureRoutes');

// List & Create courses
router
  .route('/')
  .get(courseCtrl.getCourses)
  .post(courseCtrl.createCourse);

// Retrieve, Update & Delete a single course
router
  .route('/:courseId')
  .get(courseCtrl.getCourse)
  .put(courseCtrl.updateCourse)
  .delete(courseCtrl.deleteCourse);

// *** MOUNT lectures ***/
// now any request to
//   /api/users/:userId/courses/:courseId/lectures
// will be handled by LectureRoutes
router.use('/:courseId/lectures', lectureRoutes);

module.exports = router;
