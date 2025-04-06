const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const courseRoutes = require('./routes/courseRoutes');

dotenv.config();

const app = express();
app.use(express.json());

app.use('/api/courses', courseRoutes);

module.exports = app;
