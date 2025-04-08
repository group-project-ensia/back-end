const Chat = require('../models/chat');
const OllamaService = require('../services/ollamaService');  



// Create
exports.createChat = async (req, res) => {
  try {
    const chat = await Chat.create(req.body);
    res.status(201).json(chat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getChats = async (req, res) => {
  try {
    // Retrieve all chats, including the 'messages' array
    const chats = await Chat.find().populate('courseId');  // Assuming 'courseId' is populated

    // Send the result back
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

// Update (Append new messages)
// exports.updateChat = async (req, res) => {
//   try {
//     const { messages } = req.body;

//     if (!messages || !Array.isArray(messages)) {
//       return res.status(400).json({ error: 'Messages must be an array' });
//     }

//     const chat = await Chat.findByIdAndUpdate(
//       req.params.id,
//       { $push: { messages: { $each: messages } } },  // Push each message into the array
//       { new: true }
//     );

//     if (!chat) {
//       return res.status(404).json({ error: 'Chat not found' });
//     }

//     res.json(chat);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };


// Delete
exports.deleteChat = async (req, res) => {
  try {
    await Chat.findByIdAndDelete(req.params.id);
    res.json({ message: 'Chat deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Endpoint to update chat with a new message and get response from Ollama
exports.updateChat = async (req, res) => {
  try {
      const { id } = req.params;
      const { text } = req.body;  // The message sent by the user

      // First, create the new message in your chat model
      const newMessage = { sender: 'user', text };

      // Update the chat by appending the new user message
      const chat = await Chat.findByIdAndUpdate(id, { 
          $push: { messages: newMessage }
      }, { new: true });

      // Now, get a response from the chatbot
      const botResponse = await OllamaService.generateResponse(text);

      // Create the bot's message
      const botMessage = { sender: 'bot', text: botResponse };

      // Append the bot's response to the chat
      await Chat.findByIdAndUpdate(id, { 
          $push: { messages: botMessage }
      }, { new: true });

      // Return the updated chat with both user and bot messages
      res.json(chat);

  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};