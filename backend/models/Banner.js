const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Banner = sequelize.define('Banner', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  type: {
    type: DataTypes.ENUM('HERO', 'PROMO', 'B2B_HERO', 'B2B_PROMO'),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subtitle: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  bg: {
    type: DataTypes.STRING,
    defaultValue: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)',
  },
  cta: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  link: {
    type: DataTypes.STRING,
    defaultValue: '/',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  timestamps: true,
});

module.exports = Banner;
