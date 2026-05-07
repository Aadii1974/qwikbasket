const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthService {
  static async signup(userData) {
    const { name, phone, password, role, companyName, gstNumber, fssaiNumber } = userData;
    if (!/^[6-9]\d{9}$/.test(phone)) {
      throw new Error('Invalid Indian mobile number. Must be a 10-digit number starting with 6, 7, 8, or 9.');
    }
    const existing = await User.findOne({ where: { phone } });
    if (existing) throw new Error('Phone number already registered');

    const hashedPassword = await bcrypt.hash(password, 10);
    // New B2B users require approval
    const isApproved = role === 'b2c' ? true : false;
    
    const newUser = await User.create({ 
      name, phone, password: hashedPassword, role, isApproved, 
      companyName, gstNumber, fssaiNumber
    });

    const token = jwt.sign(
      { id: newUser.id, role: newUser.role, isApproved: newUser.isApproved }, 
      process.env.JWT_SECRET, 
      { expiresIn: '30d' }
    );

    return { user: newUser, token };
  }

  static async login(phone, password) {
    const user = await User.findOne({ where: { phone } });
    if (!user) throw new Error('User not found');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error('Invalid credentials');

    const token = jwt.sign(
      { id: user.id, role: user.role, isApproved: user.isApproved }, 
      process.env.JWT_SECRET, 
      { expiresIn: '30d' }
    );
    return { user, token };
  }
  static async updateProfile(userId, updateData) {
    const { name, phone } = updateData;
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    if (phone && phone !== user.phone) {
      if (!/^[6-9]\d{9}$/.test(phone)) {
        throw new Error('Invalid Indian mobile number. Must be a 10-digit number starting with 6, 7, 8, or 9.');
      }
      const existing = await User.findOne({ where: { phone } });
      if (existing) throw new Error('Phone number already in use');
    }

    await user.update({ name, phone });
    return user;
  }
}

module.exports = AuthService;
