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
// Update Chat: Append new user message, call Gemini, append bot message
export const updateChat = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    // Create a new message object for the user's text
    const newMessage = { sender: 'user', text };

    // Update the chat with the new user message
    const chat = await Chat.findByIdAndUpdate(
      id,
      { $push: { messages: newMessage } },
      { new: true }
    );

    if (!chat) return res.status(404).json({ error: 'Chat not found' });

    // Call the Gemini service to get the bot's response
    const botResponse = await geminiService.generateResponse(text);

    // Create a new message object for the bot's response
    const botMessage = { sender: 'bot', text: botResponse };

    // Update the chat with the bot's message
    const updatedChat = await Chat.findByIdAndUpdate(
      id,
      { $push: { messages: botMessage } },
      { new: true }
    );

    // Return the updated chat with both user and bot messages
    res.json(updatedChat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
