const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user (Individual/Business)
 * @access  Public
 */
router.post('/signup', register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get token
 * @access  Public
 */
router.post('/login', login);

module.exports = router;
