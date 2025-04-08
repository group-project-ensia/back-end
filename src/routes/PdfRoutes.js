const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/PdfController');

router.post('/', pdfController.createPDF);
router.get('/', pdfController.getPDFs);
router.get('/:id', pdfController.getPDF);
router.put('/:id', pdfController.updatePDF);
router.delete('/:id', pdfController.deletePDF);
router.get('/course/:courseId', pdfController.getPDFsByCourse);
router.get('/search', pdfController.searchPDFsByTitle);

module.exports = router;
