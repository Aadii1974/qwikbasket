const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const WalletTransaction = sequelize.define('WalletTransaction', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  orderId: { type: DataTypes.UUID, allowNull: true },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  type: { type: DataTypes.ENUM('EARNED', 'REDEEMED'), allowNull: false },
  description: { type: DataTypes.STRING, allowNull: true },
}, { timestamps: true });

module.exports = WalletTransaction;
