const express = require('express');
const router = express.Router();
const { getPublicKey, subscribe, sendNotification } = require('../controllers/pushController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.get('/vapidPublicKey', getPublicKey);
// Allow anyone (or just logged in users) to subscribe. Let's allow anyone so they don't have to be logged in to get general notifications
router.post('/subscribe', subscribe);
router.post('/send', authMiddleware, adminMiddleware, sendNotification);

module.exports = router;
