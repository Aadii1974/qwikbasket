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
  // ── Home Page Image Carousel ─────────────────────────────
  // Admin uploads images that auto-scroll as full-width carousel on home page
  // Stored as JSON: [{id, url}, ...]
  heroImages: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
  },
  // ── Home Promo Cards (below Flash Sale) ──────────────────
  // Admin-managed small promotional image cards
  // Stored as JSON: [{id, url}, ...]
  homePromoCards: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
  },
  // ── Delivery/Trust Section Image ─────────────────────────
  deliverySectionImage: {
    type: DataTypes.STRING(1000),
    defaultValue: '', // Admin uploads image shown on right of delivery trust section
  },
  // ── Launch / Marketing Mode ───────────────────────────
  // When isLaunchMode=true, users can browse but NOT order
  // Ordering unlocks on launchDate (ISO date string, e.g. '2026-05-15')
  isLaunchMode: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  launchDate: {
    type: DataTypes.STRING,
    defaultValue: '',  // e.g. '2026-05-15'
  },
  launchMessage: {
    type: DataTypes.STRING(500),
    defaultValue: 'We are launching soon! Stay tuned.',
  },
  launchPopupImage: {
    type: DataTypes.STRING(1000),
    defaultValue: '',
  },
  // ── Delivery Slots Configuration ──────────────────────
  // JSON array of slot objects: [{id, label, startHour, endHour, cutoffHour}, ...]
  // cutoffHour = last hour you can ORDER for this slot today
  deliverySlots: {
    type: DataTypes.TEXT,
    defaultValue: JSON.stringify([
      { id: 's1', label: '8 AM – 10 AM',  startHour: 8,  endHour: 10, cutoffHour: 7  },
      { id: 's2', label: '12 PM – 2 PM',  startHour: 12, endHour: 14, cutoffHour: 11 },
      { id: 's3', label: '4 PM – 6 PM',   startHour: 16, endHour: 18, cutoffHour: 15 },
      { id: 's4', label: '7 PM – 9 PM',   startHour: 19, endHour: 21, cutoffHour: 18 },
    ]),
  },

}, {
  timestamps: true,
});

module.exports = Settings;
