const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Product = sequelize.define('Product', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  unit: { type: DataTypes.STRING, allowNull: false },
  ratePerUnit: { type: DataTypes.STRING, allowNull: true }, // e.g., "₹25/kg", "₹5/piece"
  customerType: { type: DataTypes.ENUM('NORMAL', 'BUSINESS', 'BOTH'), defaultValue: 'BOTH' },
  b2cOldPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  b2cNewPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  b2bOldPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  b2bNewPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  minB2BQty: { type: DataTypes.INTEGER, defaultValue: 1 },
  b2bTiers: { type: DataTypes.TEXT, allowNull: true }, // Store stringified JSON: [{minQty: 10, price: 45}, ...]
  stock: { type: DataTypes.INTEGER, defaultValue: 0 },
  images: { type: DataTypes.TEXT, allowNull: true }, // Store as stringified JSON or CSV
  description: { type: DataTypes.TEXT, allowNull: true },
  rating: { type: DataTypes.DECIMAL(2, 1), defaultValue: 0.0 },
  reviews: { type: DataTypes.INTEGER, defaultValue: 0 },
  isFlashSale: { type: DataTypes.BOOLEAN, defaultValue: false },
  packagingSize: { type: DataTypes.STRING, allowNull: true }, // e.g., "Pack of 12", "Box of 24"
  variants: { type: DataTypes.TEXT, allowNull: true }, // Store stringified JSON array of variants [{id, size, b2cOldPrice, b2cNewPrice, b2bOldPrice, b2bNewPrice, stock, minB2BQty}]
  storeId: { type: DataTypes.UUID, allowNull: true },
  categoryId: { type: DataTypes.UUID, allowNull: true },
  subCategoryId: { type: DataTypes.UUID, allowNull: true },
  isBulkOnly: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { timestamps: true });

module.exports = Product;
