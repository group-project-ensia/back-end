import GeminiService from '../services/geminiServise.js';
import Chat from '../models/chat.js';
import fs from 'fs';


const geminiService = new GeminiService();


// Create
export const createChat = async (req, res) => {
  try {
    const { courseId, messages } = req.body;

    // Step 1: Create the chat with empty messages
    const chat = await Chat.create({
      courseId,
      messages: []
    });

    // Step 2: If there's a first message, push it
    if (messages && messages.length > 0) {
      const first = messages[0];

      const newMessage = {
        sender: first.role || first.sender, // fallback if it comes with "sender"
        text: first.content || first.text
      };

      await Chat.findByIdAndUpdate(
        chat._id,
        { $push: { messages: newMessage } },
        { new: true }
      );
    }

    // Step 3: Return the final chat (with the first message)
    const updatedChat = await Chat.findById(chat._id);
    res.status(201).json(updatedChat);

  } catch (err) {
    console.error('Create Chat Error:', err);
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

    // Fetch existing chat to get full conversation context
    const existingChat = await Chat.findById(id);
    if (!existingChat) return res.status(404).json({ error: 'Chat not found' });

    // Prepare context for Gemini by extracting previous messages
    const conversationContext = existingChat.messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // Add current user message
    const newMessage = { sender: 'user', text };

    // Update chat with new user message
    const updatedChat = await Chat.findByIdAndUpdate(
      id,
      { $push: { messages: newMessage } },
      { new: true }
    );

    // Generate bot response with full conversation context
    const botResponse = await geminiService.generateResponse(
      id, 
      text, 
      conversationContext
    );

    // Create bot message
    const botMessage = { sender: 'bot', text: botResponse };

    // Add bot response to chat
    const finalChat = await Chat.findByIdAndUpdate(
      id,
      { $push: { messages: botMessage } },
      { new: true }
    );

    res.json(finalChat);
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
