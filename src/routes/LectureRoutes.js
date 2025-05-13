// routes/LectureRoutes.js
const express    = require('express');
const multer     = require('multer');
const path       = require('path');
const router     = express.Router({ mergeParams: true });
const lectureCtrl = require('../controllers/LectureController');
const lectureController = require('../controllers/LectureController');

// configure multer to store uploaded PDFs under /uploads/pdfs
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/pdfs'));
  },
  filename: (req, file, cb) => {
    // e.g. 1623432343243-my-lecture.pdf
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({
  storage,
  fileFilter: (_, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files allowed'), false);
  }
});

// List & Create
router
  .route('/')
  .get(lectureCtrl.getLectures)
  // now accepts multipart/form-data with a `pdf` file field
  .post(upload.single('pdf'), lectureCtrl.createLecture);

// Retrieve, Update & Delete
router
  .route('/:lectureId')
  .get(lectureCtrl.getLecture)
  .put(upload.single('pdf'), lectureCtrl.updateLecture)
  .delete(lectureCtrl.deleteLecture);

// Summarize Lecture PDF
router.post('/:lectureId/summarize', lectureCtrl.summarizeLecture);

router.get(
  '/:lectureId/context',
  lectureController.getLectureContext
);

module.exports = router;
