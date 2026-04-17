const express = require('express');
const router = express.Router();
const { 
  getDeliveryAgents, 
  createDeliveryAgent, 
  deleteDeliveryAgent, 
  assignOrder, 
  getAssignedOrders, 
  markOrderDelivered, 
  getAgentMetrics,
  getSettlementData,
  processSettlement
} = require('../controllers/deliveryController');
const { authMiddleware: protect, adminMiddleware: admin } = require('../middleware/authMiddleware');

// Admin Routes
router.get('/agents', protect, admin, getDeliveryAgents);
router.post('/agents', protect, admin, createDeliveryAgent);
router.delete('/agents/:id', protect, admin, deleteDeliveryAgent);
router.post('/assign', protect, admin, assignOrder);
router.get('/settlements', protect, admin, getSettlementData);
router.post('/settle', protect, admin, processSettlement);

// Delivery Agent Routes
router.get('/my-orders', protect, getAssignedOrders);
router.post('/deliver/:id', protect, markOrderDelivered);
router.get('/metrics', protect, getAgentMetrics);

module.exports = router;
