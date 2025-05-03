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
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    this.conversationHistories = new Map();
  }

  async generateResponse(chatId, prompt, externalHistory = [], maxHistoryLength = 5) {
    // … unchanged …
  }

  clearConversationHistory(chatId) {
    this.conversationHistories.delete(chatId);
    console.log(`Conversation history cleared for chat ${chatId}`);
  }
}

module.exports = GeminiService;
