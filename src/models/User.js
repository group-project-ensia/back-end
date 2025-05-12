// models/User.js
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

/* ───────────────────────────────────────── Flashcards ── */
const FlashcardSchema = new mongoose.Schema({
  question: { type: String, required: true, trim: true },
  answer:   { type: String, required: true, trim: true },
});

/* ──────────────────────────────────────── Chat Messages ─ */
const ChatMessageSchema = new mongoose.Schema({
  sender:    { type: String, enum: ['user', 'bot'], required: true },
  message:   { type: String, required: true },
  createdAt: { type: Date,   default: Date.now },
});

/* ─────────────────────────────────────────── Lectures ─── */
const LectureSchema = new mongoose.Schema(
  {
    title:      { type: String, required: true, trim: true },
    pdf:        { type: String, required: true, trim: true },
    chats:      [ChatMessageSchema],   // each chat now has its own _id
    summary:    { type: String, default: '' },
    flashcards: [FlashcardSchema],     // each flashcard now has its own _id
  },
  { timestamps: true }                // adds createdAt / updatedAt
);

/* ─────────────────────────────────────────── Courses ──── */
const CourseSchema = new mongoose.Schema(
  {
    title:    { type: String, required: true, trim: true },
    lecturer: { type: String, required: true, trim: true },
    lectures: [LectureSchema],         // every lecture already carries _id
  },
  { timestamps: true }
);

/* ─────────────────────────────────────────── Users ───── */
const UserSchema = new mongoose.Schema(
  {
    email:       { type: String, required: true, unique: true },
    password:    { type: String, required: true },
    schoolLevel: { type: String, required: true },
    speciality:  { type: String, required: true },
    courses:     [CourseSchema],       // every course already carries _id
  },
  { timestamps: true }
);

/* ───────────── Password-hash hook & helper methods ───── */
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

UserSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', UserSchema);
