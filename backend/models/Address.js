const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Address = sequelize.define('Address', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  fullName: { type: DataTypes.STRING, allowNull: false },
  phone: { 
    type: DataTypes.STRING, 
    allowNull: false,
    validate: {
      is: {
        args: /^[6-9]\d{9}$/,
        msg: "Invalid Indian mobile number. Must be a 10-digit number starting with 6, 7, 8, or 9."
      }
    }
  },
  addressLine: { type: DataTypes.TEXT, allowNull: false },
  landmark: { type: DataTypes.STRING, allowNull: true },
  pincode: { type: DataTypes.STRING, allowNull: false },
  city: { type: DataTypes.STRING, defaultValue: 'Delhi/NCR' },
  state: { type: DataTypes.STRING, defaultValue: 'Delhi' },
  isDefault: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { timestamps: true });

module.exports = Address;
