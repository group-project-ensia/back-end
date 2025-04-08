const Chat = require('../models/Chat');

// Create
exports.createChat = async (req, res) => {
  try {
    const chat = await Chat.create(req.body);
    res.status(201).json(chat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Read All
exports.getChats = async (req, res) => {
  try {
    const chats = await Chat.find().populate('courseId');
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read One
exports.getChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id).populate('courseId');
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
exports.updateChat = async (req, res) => {
  try {
    const chat = await Chat.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(chat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete
exports.deleteChat = async (req, res) => {
  try {
    await Chat.findByIdAndDelete(req.params.id);
    res.json({ message: 'Chat deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
