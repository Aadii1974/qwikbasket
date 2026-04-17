const express = require('express');
const router = express.Router();
const { register, login, getPendingB2B, approveB2BUser, saveUserLocation, updateProfile, getProfile } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/signup', register);
router.post('/login', login);
router.get('/pending-b2b', getPendingB2B);
router.post('/approve/:id', approveB2BUser);
router.post('/location', authMiddleware, saveUserLocation);
router.put('/profile', authMiddleware, updateProfile);
router.get('/profile', authMiddleware, getProfile);

module.exports = router;
