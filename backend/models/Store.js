const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Store = sequelize.define('Store', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  subtitle: { type: DataTypes.STRING, allowNull: true },
  image: { type: DataTypes.STRING, allowNull: true },
  rating: { type: DataTypes.DECIMAL(2, 1), defaultValue: 0.0 },
  itemsCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  // JSON array of section keys to show in this store's page
  // e.g. ["trending", "latest", "mostPurchased", "flashSale", "categories"]
  visibleSections: { type: DataTypes.TEXT, allowNull: true, defaultValue: '["trending","latest","mostPurchased"]' },
}, { timestamps: true });

module.exports = Store;
