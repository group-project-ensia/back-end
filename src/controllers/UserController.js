const User = require('../models/User');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
  // Validate request data
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  
  const { email, password, confirmPassword, schoolLevel, speciality } = req.body;
  
  // Ensure passwords match
  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(409).json({ error: "User already exists" });
    }
    
    // Create and save the new user; password will be hashed automatically
    user = new User({ email, password, schoolLevel, speciality });
    await user.save();
    
    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    res.status(201).json({
      token,
      user: {
        email: user.email,
        schoolLevel: user.schoolLevel,
        speciality: user.speciality,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.login = async (req, res) => {
  // Validate request data
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  
  const { email, password } = req.body;
  
  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    // Compare the provided password with the stored hashed password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    // Generate a JWT token upon successful login
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    res.json({
      token,
      user: {
        email: user.email,
        schoolLevel: user.schoolLevel,
        speciality: user.speciality,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const crypto = require("crypto");
const User = require("../models/User");
const sendEmail = require("../services/emailService"); // Hypothetical service

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Generate a token
    const token = crypto.randomBytes(20).toString("hex");

    // 3. Set token + expiration on user
    user.resetPasswordToken = token;
    // Expires in 1 hour from now
    user.resetPasswordExpires = Date.now() + 3600000;

    await user.save();

    // 4. Create a reset URL (you could put your actual frontend link here)
    const resetURL = `http://localhost:3000/reset-password?token=${token}`;

    // 5. Send the email (assuming you have a sendEmail function)
    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      text: `You requested a password reset. Please click here to reset: ${resetURL}`
      // or an HTML email, etc.
    });

    // 6. Respond
    res.json({ message: "Password reset email sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "An error occurred" });
  }
};
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // 1. Find user by token where token is not expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // $gt means “greater than”
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // 2. Update the password
    // Using bcrypt to hash the password
    const bcrypt = require("bcrypt");
    const saltRounds = 10;
    user.password = await bcrypt.hash(newPassword, saltRounds);

    // 3. Clear the token + expiration
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // 4. Save the user
    await user.save();

    // 5. Respond
    res.json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "An error occurred" });
  }
};
