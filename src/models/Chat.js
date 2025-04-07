const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  messages: [
    {
      sender: { type: String, enum: ['user', 'bot'] },
      text: String,
      timestamp: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);
