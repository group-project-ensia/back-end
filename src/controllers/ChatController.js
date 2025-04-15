import GeminiService from '../services/geminiServise.js';
import Chat from '../models/chat.js';
import fs from 'fs';

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


///// ask bot controller : 
export const askBot = async (req, res) => {
  try {
    const { text, pdf } = req.body;

    if (!text || !pdf) {
      return res.status(400).json({ error: 'Text and PDF content are required' });
    }

    // Combine the request prompt with the provided text content
    const fullPrompt = `${text}\n\nContent:\n${pdf}`;

    const botResponse = await geminiService.generateResponse(null, fullPrompt);

    res.json({ sender: 'bot', text: botResponse });
  } catch (error) {
    console.error('Bot Query Error:', error);
    res.status(500).json({ error: error.message });
  }
};


export const askBot_json = async (req, res) => {
  const prompt = req.body.prompt; // ✅ FIXED HERE
  try {
    const response = await geminiService.generateResponse(null, prompt);

    // Strip Markdown formatting if present
    const cleaned = response
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    // Try to parse JSON
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

    // Save to a real file
    fs.writeFileSync('./quiz.json', JSON.stringify(quizData, null, 2));

    // Respond to frontend
    res.json({ message: 'Quiz saved successfully!', quiz: quizData });

  } catch (error) {
    res.status(500).json({ error: 'Something went wrong', details: error.message });
  }
};
