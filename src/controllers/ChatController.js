// src/controllers/ChatController.js

const Chat           = require('../models/Chat');
const fs             = require('fs');
const GeminiService  = require('../services/geminiServise');
const geminiService  = new GeminiService();   // ← instantiate once

// Create
async function createChat(req, res) {
  try {
    const { courseId, messages } = req.body;
    const chat = await Chat.create({ courseId, messages: [] });

    if (messages && messages.length > 0) {
      const first = messages[0];
      const newMessage = {
        sender: first.role || first.sender,
        text: first.content || first.text
      };
      await Chat.findByIdAndUpdate(chat._id, { $push: { messages: newMessage } }, { new: true });
    }

    const updatedChat = await Chat.findById(chat._id);
    res.status(201).json(updatedChat);
  } catch (err) {
    console.error('Create Chat Error:', err);
    res.status(400).json({ error: err.message });
  }
}

// Get All
async function getChats(req, res) {
  try {
    const chats = await Chat.find().populate('courseId');
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get One
async function getChat(req, res) {
  try {
    const chat = await Chat.findById(req.params.id).populate('courseId');
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Delete
async function deleteChat(req, res) {
  try {
    await Chat.findByIdAndDelete(req.params.id);
    res.json({ message: 'Chat deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Update (chat + Gemini)
async function updateChat(req, res) {
  try {
    const { id } = req.params;
    const text = req.body.text ||
                 (req.body.messages && req.body.messages[0] && req.body.messages[0].text);

    if (!text) return res.status(400).json({ error: 'No message text provided' });

    const existingChat = await Chat.findById(id);
    if (!existingChat) return res.status(404).json({ error: 'Chat not found' });

    const conversationContext = existingChat.messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const newMessage = { sender: 'user', text };
    await Chat.findByIdAndUpdate(id, { $push: { messages: newMessage } }, { new: true });

    const botResponse = await geminiService.generateResponse(id, text, conversationContext);
    const botMessage  = { sender: 'bot', text: botResponse };
    const finalChat   = await Chat.findByIdAndUpdate(id, { $push: { messages: botMessage } }, { new: true });

    res.json(finalChat);
  } catch (error) {
    console.error('Update Chat Error:', error);
    res.status(500).json({ error: error.message });
  }
}

// Ask bot (plain text + PDF)
async function askBot(req, res) {
  try {
    const { text, pdf } = req.body;
    if (!text || !pdf) return res.status(400).json({ error: 'Text and PDF content are required' });

    const fullPrompt = `${text}\n\nContent:\n${pdf}`;
    const botResponse = await geminiService.generateResponse(null, fullPrompt);
    res.json({ sender: 'bot', text: botResponse });
  } catch (error) {
    console.error('Bot Query Error:', error);
    res.status(500).json({ error: error.message });
  }
}

// Ask bot and save JSON
async function askBot_json(req, res) {
  try {
    const prompt = req.body.prompt;
    const response = await geminiService.generateResponse(null, prompt);
    const cleaned  = response.replace(/```json/g, '').replace(/```/g, '').trim();

    let quizData;
    try {
      quizData = JSON.parse(cleaned);
    } catch (err) {
      return res.status(500).json({
        error: 'Failed to parse bot response as JSON',
        details: err.message,
        rawResponse: response
      });
    }

    fs.writeFileSync('./quiz.json', JSON.stringify(quizData, null, 2));
    res.json({ message: 'Quiz saved successfully!', quiz: quizData });
  } catch (error) {
    console.error('askBot_json Error:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createChat,
  getChats,
  getChat,
  deleteChat,
  updateChat,
  askBot,
  askBot_json
};
