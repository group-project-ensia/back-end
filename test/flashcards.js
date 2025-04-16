const axios = require('axios');

async function runTest() {
  try {
    const extractedText = "In the early 2000s, deep learning faced a period often referred to as its dark age. During this time, Support Vector Machines (SVMs) rose to prominence and dominated the field of machine learning. ...";

    const prompt = `Based on the following text, generate 10 flashcards. Each flashcard should contain a question and an answer. Return the result in a clean JSON array format like this: { \"question\": \"What is ...?\", \"answer\": \"Correct answer\" }, ... (10 flashcards)`;

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


    // Clean up the response text before attempting to parse
    let jsonDataString = QuizRes.data.text.trim().replace(/^```json\n/, '').replace(/\n```$/, '');

    // Ensure the cleaned data ends with a closing bracket (for JSON completeness)
    if (!jsonDataString.endsWith(']')) {
      console.warn("Warning: Incomplete JSON detected. Attempting to fix.");
      jsonDataString = jsonDataString + ']'; // Add the closing bracket
    }

    // Attempt to parse the cleaned JSON string into a JavaScript array
    try {
      const data = JSON.parse(jsonDataString);

      if (Array.isArray(data)) {
        const questions = [];
        const answers = [];

        data.forEach(item => {
          // Ensure we're handling question and answer pairs correctly
          if (item.question && item.answer) {
            questions.push(item.question);
            answers.push(item.answer); // Storing the answer
          }
        });

        console.log("Flashcards Questions Array:", questions);
        console.log("Flashcards Answers Array:", answers);
      } else {
        console.error("Data is not an array. Response structure might be different.");
      }
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError.message);
    }

  } catch (error) {
    console.error("Error occurred:");
    console.error(error.response?.data || error.message || error);
  }
}

runTest();
