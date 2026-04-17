const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  orderNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  items: {
    type: DataTypes.JSON, // Array of { productId, name, price, quantity, unit, image }
    allowNull: false,
    defaultValue: [],
  },
  subtotal: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  deliveryFee: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  packagingFee: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 10, // ₹10 Care & Packaging Fee — always applied
  },
  smallCartFee: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0, // Applied for small/low-value carts
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'),
    defaultValue: 'Pending',
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'COD',
  },
  paymentStatus: {
    type: DataTypes.ENUM('Pending', 'Paid', 'Failed', 'Refunded'),
    defaultValue: 'Pending',
  },
  deliveryType: {
    type: DataTypes.ENUM('Smart', 'Qwik'),
    defaultValue: 'Smart', // Smart = scheduled slots, Qwik = instant premium
  },
  deliveryAddress: {
    type: DataTypes.JSON, // Snapshot of address at time of order
    allowNull: false,
  },
  adminNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  deliverySlot: {
    type: DataTypes.STRING, // e.g., 'Today, 8–10 AM', 'Tomorrow, 8–10 AM', 'Qwik – 45 mins'
    allowNull: true,
  },
  estimatedDelivery: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  deliveryAgentId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  deliveryLat: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  deliveryLng: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  deliveryDistance: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  agentEarnings: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  isAgentPaid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  coinsEarned: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  coinsRedeemed: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  couponCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  discountAmount: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
}, {
  timestamps: true,
});

module.exports = Order;
