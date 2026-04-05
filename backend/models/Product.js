const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Product = sequelize.define('Product', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  unit: { type: DataTypes.STRING, allowNull: false },
  b2cPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  b2bPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  minB2BQty: { type: DataTypes.INTEGER, defaultValue: 1 },
  stock: { type: DataTypes.INTEGER, defaultValue: 0 },
  images: { type: DataTypes.TEXT, allowNull: true }, // Store as stringified JSON or CSV
  description: { type: DataTypes.TEXT, allowNull: true },
  rating: { type: DataTypes.DECIMAL(2, 1), defaultValue: 0.0 },
  reviews: { type: DataTypes.INTEGER, defaultValue: 0 }
}, { timestamps: true });

module.exports = Product;
