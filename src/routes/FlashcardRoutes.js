const express = require('express');
const router = express.Router();
const flashcardController = require('../controllers/FlashcardController');

router.post('/generate', flashcardController.generateFlashcardsFromPDF);

module.exports = router;
