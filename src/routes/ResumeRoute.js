const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/ResumeController');

router.post('/', resumeController.createResume);
router.get('/', resumeController.getResumes);
router.get('/:id', resumeController.getResume);
router.put('/:id', resumeController.updateResume);
router.delete('/:id', resumeController.deleteResume);

module.exports = router;
