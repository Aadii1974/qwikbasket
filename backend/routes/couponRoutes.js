const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, adminMiddleware, couponController.getAllCoupons);
router.get('/public', couponController.getPublicCoupons);
router.post('/validate', authMiddleware, couponController.validateCoupon);
router.post('/', authMiddleware, adminMiddleware, couponController.createCoupon);
router.put('/:id', authMiddleware, adminMiddleware, couponController.updateCoupon);
router.delete('/:id', authMiddleware, adminMiddleware, couponController.deleteCoupon);

module.exports = router;

