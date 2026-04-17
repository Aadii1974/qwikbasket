const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, calcDeliveryFee } = require('../controllers/settingsController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.get('/', getSettings); // Public – safe fields only (no secret)
router.put('/', authMiddleware, adminMiddleware, updateSettings);
router.get('/delivery-fee', calcDeliveryFee); // Public – calc fee for given lat/lng/subtotal

module.exports = router;
