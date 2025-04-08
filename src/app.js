const express = require('express');
const app = express();
const userRoutes = require('./routes/UserRoutes');
const chatRoutes = require('./routes/ChatRoutes');
const courseRoutes = require('./routes/courseRoutes');
const pdfRoutes = require('./routes/PdfRoutes');
const resumeRoutes = require('./routes/ResumeRoute');

// Middleware for parsing JSON bodies
app.use(express.json());

// Mount user routes at /api/users
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/resume', resumeRoutes);

app.get('/', (req, res) => {
  res.send('API is working');
});


module.exports = app;
