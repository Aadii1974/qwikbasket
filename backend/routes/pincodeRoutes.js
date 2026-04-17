const express = require('express');
const router = express.Router();
const { checkServiceability, getAdminPincodes, addAdminPincode, deleteAdminPincode } = require('../controllers/pincodeController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.get('/check/:pincode', checkServiceability);

// Admin only routes
router.get('/admin', authMiddleware, adminMiddleware, getAdminPincodes);
router.post('/admin', authMiddleware, adminMiddleware, addAdminPincode);
router.delete('/admin/:id', authMiddleware, adminMiddleware, deleteAdminPincode);

module.exports = router;
