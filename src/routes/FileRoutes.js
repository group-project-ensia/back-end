const express = require('express');
const multer = require('multer');
const path = require('path');
const fileController = require('../controllers/FileController');

const router = express.Router();

// Configure Multer storage to save files into the uploads folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // The uploads folder is one level up from this file (i.e., in the project root)
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    // Generate a unique filename using the current timestamp and a random number
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Route for uploading a file
// The form field name should be 'file'
router.post('/upload', upload.single('file'), fileController.uploadFile);

// Route for reading an uploaded file and saving its content to MongoDB
router.post('/read-and-save', fileController.readAndSaveFile);

module.exports = router;
