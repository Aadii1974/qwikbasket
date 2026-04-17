const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ServiceablePincode = sequelize.define('ServiceablePincode', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  pincode: { type: DataTypes.STRING, allowNull: false, unique: true },
  areaName: { type: DataTypes.STRING, allowNull: true },
  city: { type: DataTypes.STRING, allowNull: true },
  state: { type: DataTypes.STRING, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { timestamps: true });

module.exports = ServiceablePincode;
