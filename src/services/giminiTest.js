import dotenv from "dotenv";
import fetch from "node-fetch";  // Use node-fetch for making HTTP requests

dotenv.config(); // Loads .env file where your API key is stored

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

  const requestBody = {
    contents: [
      {
        parts: [{ text: "Explain how AI works" }]
      }
    ]
  };

  const url = `${endpoint}?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    // Log the full response for better debugging
    console.log("Full Gemini response:", data);

    if (response.ok) {
      // Check if content exists and log it out
      const candidates = data?.candidates || [];
      if (candidates.length > 0) {
        const content = candidates[0]?.content;
        console.log("Content object:", content);  // Log the content object to explore its structure

        // Extract the text content if available
        const text = content ? JSON.stringify(content) : 'No content in the response';
        console.log("✅ Gemini response:", text);
      } else {
        console.log("❌ No candidates found in the response.");
      }
    } else {
      console.error("❌ Gemini API Error:", data);
    }
  } catch (error) {
    console.error("❌ Gemini test failed:", error.message);
  }
}

testGemini();
