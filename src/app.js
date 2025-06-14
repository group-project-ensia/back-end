const express = require('express');
const app = express();
const userRoutes = require('./routes/UserRoutes');
const chatRoutes = require('./routes/ChatRoutes');
const courseRoutes = require('./routes/CourseRoutes');
const pdfRoutes = require('./routes/PdfRoutes');
const resumeRoutes = require('./routes/ResumeRoute');
const fileRoutes = require('./routes/FileRoutes');
const todoRoutes = require('./routes/todo.js');
const flashcardRoutes = require('./routes/FlashcardRoutes');

app.use('/api/flashcards', flashcardRoutes);
// Middleware for parsing JSON bodies
app.use(express.json());

const cors = require('cors');
const morgan  = require('morgan');
app.use(morgan('dev')); 
app.use(cors());

const lectureRoutes = require('./routes/LectureRoutes');



app.use('/api/users/:userId/courses/:courseId/lectures', lectureRoutes);

// Mount user routes at /api/users
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/users/:userId/courses', courseRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/todos', todoRoutes);

app.get('/', (req, res) => {
  res.send('API is working');
});


module.exports = app;
