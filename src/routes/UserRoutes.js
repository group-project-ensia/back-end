const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/UserController');
const { body } = require('express-validator');

router.post(
  '/signup',
  [
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('confirmPassword').exists().withMessage('Please confirm your password'),
    body('schoolLevel').notEmpty().withMessage('School level is required'),
    body('speciality').notEmpty().withMessage('Speciality is required'),
  ],
  signup
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password').exists().withMessage('Password is required'),
  ],
  login
);

module.exports = router;
