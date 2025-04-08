const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

// Load environment variables from .env file
dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('Missing MONGO_URI in .env file');
  process.exit(1);
}
app.use((req, res, next) => {
  console.log(`Incoming ${req.method} request on ${req.url}`);
  next();
});

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected');
  app.listen(PORT, () => console.log(` Server running on http://localhost:${PORT}`));
})
.catch(err => {
  console.error(' MongoDB connection error:', err.message);
  process.exit(1);
});

