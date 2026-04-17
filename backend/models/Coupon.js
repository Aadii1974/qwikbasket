const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Coupon = sequelize.define('Coupon', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  code: { type: DataTypes.STRING, allowNull: false, unique: true },
  discountAmount: { type: DataTypes.FLOAT, allowNull: false },
  isPublic: { type: DataTypes.BOOLEAN, defaultValue: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { timestamps: true });

module.exports = Coupon;
