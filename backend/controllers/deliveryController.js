const { Order, User, Settings, PaymentSettlement } = require('../models');
const { sequelize } = require('../config/db');
const { Op } = require('sequelize');

// Admin: Get all delivery agents
const getDeliveryAgents = async (req, res) => {
  try {
    const agents = await User.findAll({
      where: { role: 'delivery_agent' },
      attributes: ['id', 'name', 'phone', 'isApproved', 'createdAt']
    });
    res.status(200).json({ success: true, data: agents });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Admin: Create delivery agent
const createDeliveryAgent = async (req, res) => {
  try {
    const { name, phone, password } = req.body;
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ success: false, error: 'Invalid Indian mobile number. Must be a 10-digit number starting with 6, 7, 8, or 9.' });
    }
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    const agent = await User.create({
      name,
      phone,
      password: hashedPassword,
      role: 'delivery_agent',
      isApproved: true
    });

    res.status(201).json({ success: true, data: { id: agent.id, name: agent.name, phone: agent.phone } });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Admin: Delete delivery agent
const deleteDeliveryAgent = async (req, res) => {
  try {
    const agent = await User.findOne({ where: { id: req.params.id, role: 'delivery_agent' } });
    if (!agent) return res.status(404).json({ success: false, error: 'Agent not found' });
    await agent.destroy();
    res.status(200).json({ success: true, message: 'Agent removed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Admin: Assign order to agent
const assignOrder = async (req, res) => {
  try {
    const { orderId, agentId, agentEarnings } = req.body;
    const order = await Order.findByPk(orderId);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    const settings = await Settings.findByPk(1);
    const minPay = settings?.agentMinPayPerOrder || 20;
    // Admin manually sets the agent earnings; fallback to minimum if not provided
    const earnings = parseFloat(agentEarnings) || minPay;

    await order.update({
      deliveryAgentId: agentId,
      agentEarnings: earnings,
      status: 'Out for Delivery',
    });

    res.status(200).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delivery Agent: Get assigned orders
const getAssignedOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { 
        deliveryAgentId: req.user.id,
        status: { [Op.ne]: 'Delivered' }
      },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delivery Agent: Mark as delivered (instant — uses pre-assigned earnings)
const markOrderDelivered = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ where: { id, deliveryAgentId: req.user.id } });
    if (!order) return res.status(404).json({ success: false, error: 'Order not found or not assigned to you' });

    if (order.status === 'Delivered') {
      return res.status(400).json({ success: false, error: 'Order already delivered' });
    }

    // earnings were pre-set at assignment time by admin
    const earnings = order.agentEarnings || 0;

    await order.update({
      status: 'Delivered',
      paymentStatus: 'Paid',
      agentEarnings: earnings, // preserve admin-set value
    });

    res.status(200).json({
      success: true,
      message: 'Order marked as delivered! ✅',
      earnings,
      orderId: id,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delivery Agent: Performance Metrics
const getAgentMetrics = async (req, res) => {
  try {
    const agentId = req.user.id;
    
    // Day-wise completed
    const dayWise = await Order.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('updatedAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('deliveryDistance')), 'totalDistance'],
        [sequelize.fn('SUM', sequelize.col('agentEarnings')), 'totalEarnings']
      ],
      where: { deliveryAgentId: agentId, status: 'Delivered' },
      group: [sequelize.fn('DATE', sequelize.col('updatedAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('updatedAt')), 'DESC']]
    });

    // Monthly breakdown
    const monthly = await Order.findAll({
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('updatedAt'), '%Y-%m'), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('agentEarnings')), 'totalEarnings']
      ],
      where: { deliveryAgentId: agentId, status: 'Delivered' },
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('updatedAt'), '%Y-%m')],
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('updatedAt'), '%Y-%m'), 'DESC']]
    });

    // Overall stats
    const totalDeliveries = await Order.count({ where: { deliveryAgentId: agentId, status: 'Delivered' } });
    
    const settings = await Settings.findByPk(1);
    const incentiveThreshold = settings?.agentIncentiveThreshold || 10;
    const incentiveAmount = settings?.agentIncentiveAmount || 50;

    // Current month incentive calculation
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentMonthOrders = await Order.count({
        where: {
            deliveryAgentId: agentId,
            status: 'Delivered',
            updatedAt: { [Op.like]: `${currentMonth}%` }
        }
    });

    const incentives = Math.floor(currentMonthOrders / incentiveThreshold) * incentiveAmount;

    res.status(200).json({
      success: true,
      data: {
        dayWise,
        monthly,
        totalDeliveries,
        currentMonthStats: {
            orders: currentMonthOrders,
            incentives,
            threshold: incentiveThreshold
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Admin: Get Settlement Data (Payable amount per agent)
const getSettlementData = async (req, res) => {
    try {
        const agents = await User.findAll({
            where: { role: 'delivery_agent' },
            attributes: ['id', 'name', 'phone']
        });

        const settings = await Settings.findByPk(1);
        const incentiveThreshold = settings?.agentIncentiveThreshold || 10;
        const incentiveAmount = settings?.agentIncentiveAmount || 50;

        const report = await Promise.all(agents.map(async (agent) => {
            const unpaidOrders = await Order.findAll({
                where: { deliveryAgentId: agent.id, status: 'Delivered', isAgentPaid: false }
            });

            const totalBaseEarnings = unpaidOrders.reduce((acc, o) => acc + o.agentEarnings, 0);
            const totalDistance = unpaidOrders.reduce((acc, o) => acc + o.deliveryDistance, 0);
            const orderCount = unpaidOrders.length;
            
            // Basic incentive logic: simple threshold based on unpaid orders count
            // In a real app, this should be month-locked
            const incentives = Math.floor(orderCount / incentiveThreshold) * incentiveAmount;

            return {
                agentId: agent.id,
                name: agent.name,
                phone: agent.phone,
                orderCount,
                totalDistance: totalDistance.toFixed(2),
                baseEarnings: totalBaseEarnings.toFixed(2),
                incentives: incentives.toFixed(2),
                totalPayable: (totalBaseEarnings + incentives).toFixed(2),
                orderIds: unpaidOrders.map(o => o.id)
            };
        }));

        res.status(200).json({ success: true, data: report });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Admin: Process Payment (Mark orders as paid)
const processSettlement = async (req, res) => {
    try {
        const { agentId, orderIds, amount, period } = req.body;
        
        await sequelize.transaction(async (t) => {
            // Update orders
            await Order.update(
                { isAgentPaid: true },
                { where: { id: orderIds }, transaction: t }
            );

            // Record settlement
            await PaymentSettlement.create({
                agentId,
                amount,
                period,
                status: 'Settled',
                transactionIds: orderIds
            }, { transaction: t });
        });

        res.status(200).json({ success: true, message: 'Settlement processed successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = {
  getDeliveryAgents,
  createDeliveryAgent,
  deleteDeliveryAgent,
  assignOrder,
  getAssignedOrders,
  markOrderDelivered,
  getAgentMetrics,
  getSettlementData,
  processSettlement
};
