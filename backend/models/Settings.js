const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Settings = sequelize.define('Settings', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    defaultValue: 1, // Singleton
  },
  // ── Delivery Fee Thresholds ──────────────────────────────
  freeDeliveryThreshold: {
    type: DataTypes.FLOAT,
    defaultValue: 200, // Free delivery on orders above ₹200
  },
  standardDeliveryFee: {
    type: DataTypes.FLOAT,
    defaultValue: 25, // Standard delivery fee when below threshold
  },
  smallCartFeeThreshold: {
    type: DataTypes.FLOAT,
    defaultValue: 100, // Below ₹100 → add small cart fee
  },
  smallCartFeeAmount: {
    type: DataTypes.FLOAT,
    defaultValue: 10, // Small batch service fee
  },
  lowOrderFeeThreshold: {
    type: DataTypes.FLOAT,
    defaultValue: 50, // Below ₹50 → add low-order processing fee
  },
  lowOrderFeeAmount: {
    type: DataTypes.FLOAT,
    defaultValue: 15, // Low-order processing fee
  },
  // ── Care & Packaging ─────────────────────────────────────
  packagingFee: {
    type: DataTypes.FLOAT,
    defaultValue: 10, // ₹10 Care & Packaging Fee — always applied
  },
  // ── Qwik Delivery ────────────────────────────────────────
  qwikDeliveryFee: {
    type: DataTypes.FLOAT,
    defaultValue: 30, // Premium instant delivery surcharge
  },
  qwikDeliveryCutoffHour: {
    type: DataTypes.INTEGER,
    defaultValue: 20, // Qwik delivery available until 8 PM (hour 20)
  },
  // ── Night Mode ───────────────────────────────────────────
  nightModeStartHour: {
    type: DataTypes.INTEGER,
    defaultValue: 0, // Show shutter from midnight (hour 0)
  },
  nightModeEndHour: {
    type: DataTypes.INTEGER,
    defaultValue: 6, // Reopen at 6 AM (hour 6)
  },
  // ── Store Location (legacy — kept for reference) ─────────
  storeLatitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: null,
  },
  storeLongitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: null,
  },
  // ── Payment Keys ─────────────────────────────────────────
  razorpayKeyId: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  razorpayKeySecret: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  googleMapsApiKey: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  // ── Legacy Vegetable Slot Config (kept for backward compat) ─
  vegetableMorningSlotStart: {
    type: DataTypes.STRING,
    defaultValue: '08:00',
  },
  vegetableMorningSlotEnd: {
    type: DataTypes.STRING,
    defaultValue: '10:00',
  },
  vegetableEveningSlotStart: {
    type: DataTypes.STRING,
    defaultValue: '16:00',
  },
  vegetableEveningSlotEnd: {
    type: DataTypes.STRING,
    defaultValue: '18:00',
  },
  vegetableSlotsEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  // ── Delivery Agent Payment Config ────────────────────────
  agentPayPerKm: {
    type: DataTypes.FLOAT,
    defaultValue: 5,
  },
  agentMinPayPerOrder: {
    type: DataTypes.FLOAT,
    defaultValue: 20,
  },
  agentIncentiveThreshold: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
  },
  agentIncentiveAmount: {
    type: DataTypes.FLOAT,
    defaultValue: 50,
  },
  // ── Farmer Coins Config ──────────────────────────────
  farmerCoinEarningPercentage: {
    type: DataTypes.FLOAT,
    defaultValue: 5, // Earn 5% of order value as coins
  },
  farmerCoinRedemptionRate: {
    type: DataTypes.FLOAT,
    defaultValue: 1, // 1 coin = ₹1
  },
  // ── Branding ─────────────────────────────────────────────
  splashVideoUrl: {
    type: DataTypes.STRING,
    defaultValue: '', // User will set this from Admin
  },

}, {
  timestamps: true,
});

module.exports = Settings;
