import GeminiService from '../services/geminiServise.js';
import Chat from '../models/chat.js';

const geminiService = new GeminiService();

// Create
export const createChat = async (req, res) => {
  try {
    const chat = await Chat.create(req.body);
    res.status(201).json(chat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get All Chats
export const getChats = async (req, res) => {
  try {
    const chats = await Chat.find().populate('courseId');
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get One Chat
export const getChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id).populate('courseId');
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Chat
export const deleteChat = async (req, res) => {
  try {
    await Chat.findByIdAndDelete(req.params.id);
    res.json({ message: 'Chat deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateChat = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Extract text, supporting both direct text and nested messages
    const text = req.body.text || 
                 (req.body.messages && req.body.messages[0] && req.body.messages[0].text);

    if (!text) {
      return res.status(400).json({ error: 'No message text provided' });
    }

    const newMessage = { sender: 'user', text };

    const chat = await Chat.findByIdAndUpdate(
      id,
      { $push: { messages: newMessage } },
      { new: true }
    );

    if (!chat) return res.status(404).json({ error: 'Chat not found' });

    // Pass chat ID to maintain conversation context
    const botResponse = await geminiService.generateResponse(id, text);

    const botMessage = { sender: 'bot', text: botResponse };

    const updatedChat = await Chat.findByIdAndUpdate(
      id,
      { $push: { messages: botMessage } },
      { new: true }
    );

    res.json(updatedChat);
  } catch (error) {
    console.error('Update Chat Error:', error);
    res.status(500).json({ error: error.message });
  }
};
