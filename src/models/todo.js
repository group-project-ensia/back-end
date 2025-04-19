const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  title: {
    type: String,
    required: true
  },
  dueDate: { type: Date, default: Date.now },
  description: String,
  status: {
    type: String,
    enum: ['doing', 'done'],
    default: 'doing'
  },
  isDone: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
  
});

module.exports = mongoose.model('Todo', todoSchema);
