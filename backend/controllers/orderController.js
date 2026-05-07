const { Order, User, Settings, Product, WalletTransaction, Coupon, ValuePack } = require('../models');
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
      coinsRedeemed = 0, discountAmount = 0, bulkVolumeDiscount = 0, couponCode = null
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
      if (item.isValuePack) {
        const pack = await ValuePack.findByPk(item.productId, { transaction: t });
        if (pack) {
          await pack.update({ stock: Math.max(0, (pack.stock || 0) - (item.quantity || 1)) }, { transaction: t });
        }
        continue;
      }
      const actualProductId = item.baseProductId || item.productId || item.id;
      if (!actualProductId || typeof actualProductId !== 'string' || actualProductId.startsWith('c_') || actualProductId.startsWith('gift_')) continue;
      
      let product;
      try {
         product = await Product.findByPk(actualProductId, { transaction: t, lock: true });
      } catch (err) { continue; }
      if (!product) continue;

      const ordered = Number(item.quantity) || 0;
      
      if (item.variantId && product.variants) {
         let variants = [];
         try { variants = JSON.parse(product.variants); } catch (e) {}
         const variantIndex = variants.findIndex(v => v.id === item.variantId);
         if (variantIndex !== -1) {
            const currentStock = Number(variants[variantIndex].stock) || 0;
            if (currentStock < ordered) {
              await t.rollback();
              return res.status(400).json({
                success: false,
                error: `"${product.name} - ${variants[variantIndex].size}" only has ${currentStock} units left. Please adjust your cart.`
              });
            }
            variants[variantIndex].stock = currentStock - ordered;
            await product.update({ variants: JSON.stringify(variants) }, { transaction: t });
            continue;
         }
      }

      const currentStock = Number(product.stock) || 0;
      if (currentStock < ordered) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          error: `"${product.name}" only has ${currentStock} units left. Please adjust your cart.`
        });
      }
      // ── B2B MOQ Validation ─────────────────────────────────
      if (orderingUser?.role === 'b2b') {
         // Check both variant-level and product-level MOQ
         let minMOQ = 1;
         if (item.variantId && product.variants) {
            let variants = [];
            try { variants = JSON.parse(product.variants); } catch (e) {}
            const v = variants.find(v => v.id === item.variantId);
            if (v) minMOQ = Number(v.minB2BQty || product.minB2BQty || 1);
         } else {
            minMOQ = Number(product.minB2BQty || 1);
         }

         if (ordered < minMOQ) {
           await t.rollback();
           return res.status(400).json({
             success: false,
             error: `"${product.name}" requires a minimum quantity of ${minMOQ} for B2B orders.`
           });
         }
      }

      await product.update({ stock: currentStock - ordered }, { transaction: t });
    }

    // Calculate earnings (added to user balance instantly on order placement)
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
      discountAmount,
      bulkVolumeDiscount: bulkVolumeDiscount || 0
    }, { transaction: t });

    // Handle User Wallet (Instant credit/debit)
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
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'phone', 'role'] }],
    });
    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Admin: Update order status
const updateOrderStatus = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { status, adminNotes, estimatedDelivery, paymentStatus } = req.body;
    const { id } = req.params;

    const order = await Order.findByPk(id, { transaction: t, lock: true });
    if (!order) {
      await t.rollback();
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const oldStatus = order.status;
    const user = await User.findByPk(order.userId, { transaction: t, lock: true });

    // ── Handle Farmer Coins Logic (Instant Credit Model) ───────
    
    // 1. REVERSAL ON CANCEL: Deduct earned coins & Refund redeemed coins
    if (status === 'Cancelled' && oldStatus !== 'Cancelled') {
      // Refund redeemed coins
      if (order.coinsRedeemed > 0) {
        await WalletTransaction.create({
          userId: user.id,
          orderId: order.id,
          amount: order.coinsRedeemed,
          type: 'EARNED', 
          description: `Refunded coins from cancelled order ${order.orderNumber}`
        }, { transaction: t });

        await user.update({
          farmerCoins: user.farmerCoins + order.coinsRedeemed
        }, { transaction: t });
      }

      // Reversal of earned coins (since they were added instantly on placement)
      if (order.coinsEarned > 0) {
        await WalletTransaction.create({
          userId: user.id,
          orderId: order.id,
          amount: order.coinsEarned,
          type: 'REDEEMED',
          description: `Reversal of earned coins from cancelled order ${order.orderNumber}`
        }, { transaction: t });

        await user.update({
          farmerCoins: user.farmerCoins - order.coinsEarned
        }, { transaction: t });
      }
    }

    // 2. RE-ADD COINS IF UN-CANCELLED (Edge case)
    if (oldStatus === 'Cancelled' && status !== 'Cancelled') {
       // If user previously lost earned coins, give them back
       if (order.coinsEarned > 0) {
          await user.update({ farmerCoins: user.farmerCoins + order.coinsEarned }, { transaction: t });
       }
       // If user previously got refund of redeemed coins, take them away again
       if (order.coinsRedeemed > 0) {
          await user.update({ farmerCoins: user.farmerCoins - order.coinsRedeemed }, { transaction: t });
       }
    }

    await order.update({ 
      ...(status && { status }),
      ...(adminNotes !== undefined && { adminNotes }),
      ...(estimatedDelivery && { estimatedDelivery }),
      ...(paymentStatus && { paymentStatus }),
    }, { transaction: t });

    await t.commit();
    res.status(200).json({ success: true, data: order });
  } catch (err) {
    await t.rollback();
    res.status(400).json({ success: false, error: err.message });
  }
};

// Admin: Delete / cancel order
const deleteOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id, { transaction: t, lock: true });
    if (!order) {
      await t.rollback();
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const user = await User.findByPk(order.userId, { transaction: t, lock: true });

    // Reversal logic if order is deleted directly
    if (order.status === 'Delivered' && order.coinsEarned > 0) {
      await user.update({ farmerCoins: user.farmerCoins - order.coinsEarned }, { transaction: t });
    }
    if (order.status !== 'Cancelled' && order.coinsRedeemed > 0) {
      // Refund if it wasn't already cancelled/refunded
      await user.update({ farmerCoins: user.farmerCoins + order.coinsRedeemed }, { transaction: t });
    }

    await order.destroy({ transaction: t });
    await t.commit();
    res.status(200).json({ success: true, message: 'Order deleted and coins adjusted' });
  } catch (err) {
    await t.rollback();
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
