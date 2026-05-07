const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  phone: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true,
    validate: {
      is: {
        args: /^[6-9]\d{9}$/,
        msg: "Invalid Indian mobile number. Must be a 10-digit number starting with 6, 7, 8, or 9."
      }
    }
  },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('b2c', 'b2b', 'admin', 'delivery_agent'), defaultValue: 'b2c' },
  isApproved: { type: DataTypes.BOOLEAN, defaultValue: false },
  companyName: { type: DataTypes.STRING, allowNull: true },
  gstNumber: { type: DataTypes.STRING, allowNull: true },
  fssaiNumber: { type: DataTypes.STRING, allowNull: true },
  latitude: { type: DataTypes.FLOAT, allowNull: true, defaultValue: null },
  longitude: { type: DataTypes.FLOAT, allowNull: true, defaultValue: null },
  locationLabel: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
  farmerCoins: { type: DataTypes.FLOAT, defaultValue: 0 },
}, { timestamps: true });

module.exports = User;
