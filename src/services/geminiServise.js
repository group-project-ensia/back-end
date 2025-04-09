import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

// Masked API key for logging
const maskedApiKey = process.env.GEMINI_API_KEY 
  ? process.env.GEMINI_API_KEY.substring(0, 5) + '...' + process.env.GEMINI_API_KEY.slice(-5)
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

    // Optional: List models once on startup
    this.listAvailableModels();
  }

  // Optional: For debugging available models
  async listAvailableModels() {
    try {
      const result = await this.genAI.listModels();
      console.log('✅ Available Gemini Models:');
      result.models.forEach(model => {
        console.log(`- ${model.name}`);
      });
    } catch (error) {
      console.error('❌ Error listing models:', error);
    }
  }

  async generateResponse(prompt) {
    try {
      if (!prompt) throw new Error('Prompt cannot be empty');

      const processedPrompt = typeof prompt === 'string' ? prompt.trim() : JSON.stringify(prompt);
      if (!processedPrompt.length) throw new Error('Processed prompt is empty');

      console.log("Sending request to Gemini...");
      const result = await this.model.generateContent(processedPrompt);
      const response = await result.response;

      if (!response) throw new Error('No response received from Gemini');

      const text = response.text();
      if (!text) throw new Error('Empty response text from Gemini');

      console.log("Gemini Response:", text);
      return text;

    } catch (error) {
      console.error("❌ Gemini API Error:", {
        message: error.message,
        name: error.name,
        prompt: prompt
      });
      throw error;
    }
  }
}

export default GeminiService;
