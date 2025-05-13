const axios = require('axios');

async function runTest() {
  try {
    const difficulty_level = "hard";
        
           const lectureID = "6823468bdaa7d6ba96d7b110";
           const courseID = "68231fefd0483d35afc6c3e2";
           const userID="681e66a9a1f352628d8ee50a";
           // 1. Call the lecture context API
           const contextResponse = await axios.get(
             `http://localhost:5000/api/users/${userID}/courses/${courseID}/lectures/${lectureID}/context`,
             {
               headers: {
                 'Content-Type': 'application/json',
               },
             }
           );
           
    
        const extractedText = contextResponse.data.context;
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
