const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  filePath: { type: String, required: true },
  content: { type: String }  // This field will store file content once it is read
});

module.exports = mongoose.model('File', fileSchema);
