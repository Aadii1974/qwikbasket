const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ValuePack = sequelize.define('ValuePack', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING, // Primary image for the hamper
    allowNull: true,
  },
  price: {
    type: DataTypes.FLOAT, // The discounted price of the whole pack
    allowNull: false,
    defaultValue: 0,
  },
  originalPrice: {
    type: DataTypes.FLOAT, // The sum of individual item prices
    allowNull: false,
    defaultValue: 0,
  },
  items: {
    type: DataTypes.JSON, // Array of { productId, name, quantity, unit, priceSnapshot }
    allowNull: false,
    defaultValue: [],
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 99,
  }
}, {
  timestamps: true,
});

module.exports = ValuePack;
