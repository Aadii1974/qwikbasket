const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('b2c', 'b2b', 'admin'), defaultValue: 'b2c' },
  isApproved: { type: DataTypes.BOOLEAN, defaultValue: false },
  companyName: { type: DataTypes.STRING, allowNull: true },
  gstNumber: { type: DataTypes.STRING, allowNull: true },
  fssaiNumber: { type: DataTypes.STRING, allowNull: true },
}, { timestamps: true });

module.exports = User;
