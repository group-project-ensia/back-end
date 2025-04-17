const File = require('../models/File');
const fs = require('fs').promises;
const pdfParse = require('pdf-parse');

exports.uploadFile = async (req, res) => {
  try {
    const fileData = req.file;
    if (!fileData) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const newFile = new File({
      filePath: fileData.path
    });
    const savedFile = await newFile.save();
    res.status(200).json({
      message: "PDF uploaded successfully",
      fileDetails: fileData,
      fileRecord: savedFile
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Error uploading file" });
  }
};

exports.readAndSaveFile = async (req, res) => {
  try {
    const { fileId } = req.body;
    if (!fileId) {
      return res.status(400).json({ message: "fileId is required" });
    }

    const fileDoc = await File.findById(fileId);
    if (!fileDoc) {
      return res.status(404).json({ message: "File not found" });
    }

    // Read PDF file as a buffer
    const dataBuffer = await fs.readFile(fileDoc.filePath);

    // Extract text using pdf-parse
    const pdfData = await pdfParse(dataBuffer);

    // Save the extracted text to MongoDB
    fileDoc.content = pdfData.text;
    await fileDoc.save();

    res.status(200).json({
      message: "PDF text extracted and saved successfully",
      fileRecord: fileDoc
    });
  } catch (error) {
    console.error("Error processing PDF:", error);
    res.status(500).json({ message: "Error extracting text from PDF" });
  }
};
