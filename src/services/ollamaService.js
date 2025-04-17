
/*const fetch = require('node-fetch');  

class OllamaService {
    constructor() {
        this.API_URL = 'http://localhost:11434/api/generate';  // Ollama API URL
    }

    // Method to generate responses from the chatbot
    async generateResponse(prompt, maxTokens = 100) {
        try {
            console.log('Sending request to Ollama...', { prompt, maxTokens });

            // Sending the request to Ollama's API
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: "llama3.2",  // You can update this if needed
                    prompt: prompt,
                    stream: false,  // Set to true for streaming responses
                    options: {
                        num_predict: maxTokens,
                        temperature: 0.7,
                        top_k: 40,
                        top_p: 0.9,
                    }
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            // Parsing response data from Ollama API
            const data = await response.json();
            console.log('Received response from Ollama:', data);
            return data.response;  // Make sure 'response' is the correct key
        } catch (error) {
            console.error('Error in OllamaService:', error);
            throw error;  // Re-throw to handle elsewhere
        }
    }
}

module.exports = new OllamaService();
*/