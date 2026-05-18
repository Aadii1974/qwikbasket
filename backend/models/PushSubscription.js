const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PushSubscription = sequelize.define('PushSubscription', {
  endpoint: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  keys: {
    type: DataTypes.JSON,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
});

module.exports = PushSubscription;
