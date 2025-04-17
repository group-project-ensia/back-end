const axios = require('axios');

async function createChatWithPdf() {
  try {
    const extractedText = "In the early 2000s, deep learning faced a period often referred to as its dark age. During this time, Support Vector Machines (SVMs) rose to prominence and dominated the field of machine learning. ..."; // Replace with actual text

    const prompt = `You are a helpful assistant trained to answer questions based on the following PDF content. The content of this PDF covers various topics related to machine learning, deep learning, and the history of these technologies, including the "dark age" of deep learning, the rise of Support Vector Machines (SVMs), and the technologies that were dominant during that period.

Please read the following text carefully, and be prepared to answer any questions the user may ask based on this content. Provide relevant and concise answers to their queries.

Text:
${extractedText}

Now, feel free to ask me any questions related to the above text.`;

    const response = await axios.post(
      'http://localhost:5000/api/chats',
      {
        courseId: "67f44b53f0db698b1023c192",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const chatId = response.data._id;
    console.log("✅ Chat created successfully!");
    console.log("🆔 Chat ID:", chatId);

    return chatId; // if you want to use it in another part of the code
  } catch (error) {
    console.error("❌ Error occurred while creating the chat:");
    console.error(error.response?.data || error.message || error);
  }
}

createChatWithPdf();
