const dotenv                 = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();

const maskedApiKey = process.env.GEMINI_API_KEY
  ? process.env.GEMINI_API_KEY.substring(0, 5) + '...' + process.env.GEMINI_API_KEY.slice(-20)
  : 'No API key found';
console.log('Gemini API Key (masked):', maskedApiKey);

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key is not set in environment variables');
    }

    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Use the gemini-2.0-flash model
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Conversation history storage
    this.conversationHistories = new Map();
  }

  /**
   * Generate a response with context management
   * @param {string} chatId - Unique identifier for the conversation
   * @param {string} prompt - User's input message
   * @param {Array} [externalHistory] - Optional external conversation history
   * @param {number} maxHistoryLength - Maximum number of messages to keep in history
   * @returns {Promise<string>} AI's response
   */
  async generateResponse(chatId, prompt, externalHistory = [], maxHistoryLength = 5) {
    try {
      if (!prompt) throw new Error('Prompt cannot be empty');

      // Generate a unique chatId for system conversations if not provided
      const effectiveChatId = chatId || `system_chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Ensure we have a history for this chat
      if (!this.conversationHistories.has(effectiveChatId)) {
        this.conversationHistories.set(effectiveChatId, []);
      }

      const history = this.conversationHistories.get(effectiveChatId);

      // Merge external history with existing history if provided
      if (externalHistory && externalHistory.length > 0) {
        // Replace the entire history with the external history
        history.splice(0, history.length, ...externalHistory);
      }

      // Process and validate prompt
      const processedPrompt = typeof prompt === 'string' ? prompt.trim() : JSON.stringify(prompt);
      if (!processedPrompt.length) throw new Error('Processed prompt is empty');

      // Add current user message to history
      history.push({ role: 'user', parts: [{ text: processedPrompt }] });

      // Maintain maximum history length
      if (history.length > maxHistoryLength * 2) {
        history.splice(0, history.length - (maxHistoryLength * 2));
      }

      // Prepare chat history for context
      const chat = this.model.startChat({
        history: history.slice(0, -1), // Exclude the last message (current user input)
        generationConfig: {
          maxOutputTokens: 500, // Limit response length
        }
      });

      console.log(`Generating response for chat ${effectiveChatId}...`);

      // Generate response
      const result = await chat.sendMessage(processedPrompt);
      const response = await result.response;

      if (!response) throw new Error('No response received from Gemini');

      const text = response.text();
      if (!text) throw new Error('Empty response text from Gemini');

      // Add AI response to history
      history.push({ role: 'model', parts: [{ text }] });

      console.log(`Gemini Response for ${effectiveChatId}:`, text);
      return text;

    } catch (error) {
      console.error(" Gemini API Error:", {
        message: error.message,
        name: error.name,
        chatId: effectiveChatId,
        prompt: prompt
      });
      throw error;
    }
  }

  /**
   * Clear conversation history for a specific chat
   * @param {string} chatId - Unique identifier for the conversation
   */
  clearConversationHistory(chatId) {
    this.conversationHistories.delete(chatId);
    console.log(`Conversation history cleared for chat ${chatId}`);
  }
}

module.exports = GeminiService;
