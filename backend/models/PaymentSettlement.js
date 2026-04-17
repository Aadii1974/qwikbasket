const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PaymentSettlement = sequelize.define('PaymentSettlement', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  agentId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  period: {
    type: DataTypes.STRING, // e.g. "April 2026"
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Settled'),
    defaultValue: 'Settled', // User processes manually and marks as settled
  },
  transactionIds: {
    type: DataTypes.JSON, // List of order IDs included in this settlement
    allowNull: true,
  }
}, {
  timestamps: true,
});

module.exports = PaymentSettlement;
