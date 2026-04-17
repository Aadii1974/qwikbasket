const express = require('express');
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  getStats,
  createRazorpayOrder,
} = require('../controllers/orderController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// User routes (auth required)
router.post('/', authMiddleware, createOrder);
router.post('/razorpayCreate', authMiddleware, createRazorpayOrder);
router.get('/my', authMiddleware, getUserOrders);
router.get('/my/:id', authMiddleware, getOrderById);

// Admin routes
router.get('/admin/stats', authMiddleware, adminMiddleware, getStats);
router.get('/admin/all', authMiddleware, adminMiddleware, getAllOrders);
router.put('/admin/:id', authMiddleware, adminMiddleware, updateOrderStatus);
router.delete('/admin/:id', authMiddleware, adminMiddleware, deleteOrder);

module.exports = router;
