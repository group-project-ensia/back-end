const axios = require('axios');

async function runTest() {
  try {
    const difficulty_level = "hard";
    const extractedText = "Artificial Neural Networks (ANNs) are computer systems inspired by the human brain. They consist of layers of nodes (neurons) that process information through connections with adjustable weights. An ANN typically has an input layer, one or more hidden layers, and an output layer. These networks are trained on data, learning patterns by adjusting weights to minimize prediction errors. ANNs are used in tasks like image recognition, speech processing, and language translation. They are especially useful when working with large, complex datasets. Overall, ANNs are a key part of modern artificial intelligence and deep learning applications.";

    const prompt = `Based on the following text, generate 5 multiple-choice quiz questions with a ${difficulty_level}. Each question should have 4 choices. Put the correct answer as the first choice. Return the result in a clean JSON array format like this: {  \"question\": \"What is ...?\",    \"choices\": [\"Correct answer\", \"Wrong choice 1\", \"Wrong choice 2\", \"Wrong choice 3\"]  },  ... (10 questions)\n]\n`;

    const QuizRes = await axios.post(
      'http://localhost:5000/api/chats/ask-bot',
      {
        text: prompt,
        pdf: extractedText
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );


    let jsonDataString = QuizRes.data.text.trim().replace(/^```json\n/, '').replace(/\n```$/, '');


    // // Ensure the cleaned data ends with a closing bracket (for JSON completeness)
    // if (!jsonDataString.endsWith(']')) {
    //   console.warn("Warning: Incomplete JSON detected. Attempting to fix.");
    //   jsonDataString = jsonDataString + ']'; // Add the closing bracket
    // }

    
    try {
      const data = JSON.parse(jsonDataString);

      if (Array.isArray(data)) {
        const questions = [];
        const answers = [];

        data.forEach(item => {
          questions.push(item.question);
          answers.push(item.choices); 
        });

        console.log(" Questions Array:", questions);
        console.log(" Answers Matrix:", answers);
      } else {
        console.error(" Data is not an array. Response structure might be different.");
      }
    } catch (parseError) {
      console.error(" Error parsing JSON:", parseError.message);
    }

  } catch (error) {
    console.error(" Error occurred:");
    console.error(error.response?.data || error.message || error);
  }
}

runTest();
