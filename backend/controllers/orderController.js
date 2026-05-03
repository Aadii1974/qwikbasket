const { Order, User, Settings, Product, WalletTransaction, Coupon } = require('../models');
const { sequelize } = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const Razorpay = require('razorpay');

const LOW_STOCK_THRESHOLD = 10; // units

// Generate order number like QB-20240407-XXXX
const generateOrderNumber = () => {
  const date = new Date();
  const yyyymmdd = date.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `QB-${yyyymmdd}-${rand}`;
};

// User: Place an order
const createOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      items, subtotal, deliveryFee, packagingFee, smallCartFee, totalAmount,
      paymentMethod, deliveryAddress, deliverySlot, deliveryType,
      paymentId, deliveryLat, deliveryLng, deliveryDistance,
      coinsRedeemed = 0, discountAmount = 0, couponCode = null
    } = req.body;

    if (!items || items.length === 0) {
      await t.rollback();
      return res.status(400).json({ success: false, error: 'No items in order' });
    }
    if (!deliveryAddress) {
      await t.rollback();
      return res.status(400).json({ success: false, error: 'Delivery address is required' });
    }

    // ── Launch Mode Gate ────────────────────────────────
    const settingsCheck = await Settings.findByPk(1, { transaction: t });
    if (settingsCheck?.isLaunchMode) {
      const launchDate = settingsCheck.launchDate;
      const today = new Date().toISOString().split('T')[0];
      if (!launchDate || today < launchDate) {
        await t.rollback();
        return res.status(403).json({
          success: false,
          error: settingsCheck.launchMessage || 'Ordering is not open yet. We are launching soon!',
          launchDate,
          isLaunchMode: true,
        });
      }
    }

    // ── B2B Verification Gate ────────────────────────────
    const orderingUser = await User.findByPk(req.user.id, { transaction: t });
    if (orderingUser?.role === 'b2b' && !orderingUser?.isApproved) {
      await t.rollback();
      return res.status(403).json({
        success: false,
        error: 'Your business account is pending verification. You will be able to place orders once approved by our team.',
        b2bPending: true,
      });
    }

    const user = await User.findByPk(req.user.id, { transaction: t, lock: true });
    
    if (coinsRedeemed > 0 && user.farmerCoins < coinsRedeemed) {
      await t.rollback();
      return res.status(400).json({ success: false, error: 'Not enough farmer coins' });
    }

    if (couponCode) {
       const coupon = await Coupon.findOne({ where: { code: couponCode, isActive: true }, transaction: t });
       if (!coupon) {
         await t.rollback();
         return res.status(400).json({ success: false, error: 'Invalid or expired coupon' });
       }
    }

    // ── Stock validation & deduction ─────────────────────────────
    for (const item of items) {
      if (!item.productId) continue; // Skip if no productId (e.g. custom items)
      const product = await Product.findByPk(item.productId, { transaction: t, lock: true });
      if (!product) continue; // Product may have been deleted, soft-skip

      const ordered = Number(item.quantity) || 0;
      const currentStock = Number(product.stock) || 0;

      if (currentStock < ordered) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          error: `"${product.name}" only has ${currentStock} units left. Please adjust your cart.`
        });
      }

      await product.update({ stock: currentStock - ordered }, { transaction: t });
    }

    // Money paid with actual curreny (assume totalAmount is the final paid amount).
    // Let's give percentage of the total amount back as farmer coins
    const settings = await Settings.findByPk(1, { transaction: t });
    const earningRate = settings?.farmerCoinEarningPercentage || 5;
    const coinsEarned = Math.floor(totalAmount * (earningRate / 100));

    // ── Create Order ──────────────────────────────────────────────
    const order = await Order.create({
      userId: req.user.id,
      orderNumber: generateOrderNumber(),
      items,
      subtotal,
      deliveryFee: deliveryFee || 0,
      packagingFee: packagingFee || 10,
      smallCartFee: smallCartFee || 0,
      totalAmount,
      paymentMethod: paymentMethod || 'COD',
      deliveryAddress,
      deliverySlot: deliverySlot || 'Smart Delivery',
      deliveryType: deliveryType || 'Smart',
      status: 'Pending',
      paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'Paid',
      deliveryLat: deliveryLat || null,
      deliveryLng: deliveryLng || null,
      deliveryDistance: deliveryDistance || 0,
      adminNotes: paymentId ? `Razorpay Payment ID: ${paymentId}` : null,
      coinsEarned,
      coinsRedeemed,
      couponCode,
      discountAmount
    }, { transaction: t });

    if (coinsRedeemed > 0) {
      await WalletTransaction.create({
        userId: user.id,
        orderId: order.id,
        amount: coinsRedeemed,
        type: 'REDEEMED',
        description: `Redeemed on order ${order.orderNumber}`
      }, { transaction: t });
    }

    if (coinsEarned > 0) {
      await WalletTransaction.create({
        userId: user.id,
        orderId: order.id,
        amount: coinsEarned,
        type: 'EARNED',
        description: `Earned from order ${order.orderNumber}`
      }, { transaction: t });
    }

    await user.update({
      farmerCoins: user.farmerCoins - coinsRedeemed + coinsEarned
    }, { transaction: t });

    await t.commit();
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    await t.rollback();
    res.status(400).json({ success: false, error: err.message });
  }
};


// User: Get their own orders
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// User: Get single order detail
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    res.status(200).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Admin: Get all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'phone'] }],
    });
    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Admin: Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { status, adminNotes, estimatedDelivery, paymentStatus } = req.body;
    const { id } = req.params;

    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    await order.update({ 
      ...(status && { status }),
      ...(adminNotes !== undefined && { adminNotes }),
      ...(estimatedDelivery && { estimatedDelivery }),
      ...(paymentStatus && { paymentStatus }),
    });

    res.status(200).json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Admin: Delete / cancel order
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    await order.destroy();
    res.status(200).json({ success: true, message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Admin: Get Dashboard Stats
const getStats = async (req, res) => {
  try {
    const orders = await Order.findAll();
    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((acc, o) => acc + o.totalAmount, 0);

    const activeOrders = orders.filter(o => ['Pending', 'Processing', 'Packed', 'Shipped', 'Out for Delivery'].includes(o.status)).length;
    const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;

    const b2bUsers = await User.findAll({ where: { role: 'b2b' } });
    const pendingB2B = b2bUsers.filter(u => !u.isApproved).length;

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        activeOrders,
        deliveredOrders,
        totalB2B: b2bUsers.length,
        pendingB2B
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    let settings = await Settings.findByPk(1);
    const keyId = settings?.razorpayKeyId || process.env.RAZORPAY_KEY_ID;
    const keySecret = settings?.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET;
    
    if (!keyId || !keySecret) {
       return res.status(500).json({ success: false, error: 'Razorpay keys not configured' });
    }

    const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`
    };
    
    const order = await rzp.orders.create(options);
    res.status(200).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { createOrder, getUserOrders, getOrderById, getAllOrders, updateOrderStatus, deleteOrder, getStats, createRazorpayOrder };
