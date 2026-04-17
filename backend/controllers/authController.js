const AuthService = require('../services/authService');
const User = require('../models/User');

const register = async (req, res) => {
  try {
    console.log('📝 Signup Request Received:', req.body.phone, 'Role:', req.body.role);
    const result = await AuthService.signup(req.body);
    console.log('✅ Signup Success:', result.user.phone);
    res.status(201).json({ success: true, message: 'User registered successfully', data: result.user, token: result.token });
  } catch (err) {
    console.error('❌ Signup Failed:', err.message);
    res.status(400).json({ success: false, error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    console.log('🔑 Login Attempt:', phone);
    const result = await AuthService.login(phone, password);
    console.log('✅ Login Success:', phone, 'Role:', result.user.role);
    res.status(200).json({ success: true, message: 'Login successful', ...result });
  } catch (err) {
    console.error('❌ Login Failed:', err.message);
    res.status(401).json({ success: false, error: err.message });
  }
};

// GET /api/auth/pending-b2b
// Returns all B2B users who have not yet been approved
const getPendingB2B = async (req, res) => {
  try {
    console.log('🔎 Searching for Pending B2B users...');
    const pendingUsers = await User.findAll({
      where: { role: 'b2b', isApproved: false },
      attributes: ['id', 'name', 'phone', 'companyName', 'gstNumber', 'fssaiNumber', 'createdAt'],
    });
    console.log('📊 Found Pending Users:', pendingUsers.length);
    res.status(200).json({ success: true, data: pendingUsers });
  } catch (err) {
    console.error('❌ Fetch Pending B2B Failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/auth/approve/:id
// Approves a B2B user by ID
const approveB2BUser = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await User.update({ isApproved: true }, { where: { id } });
    if (!updated) return res.status(404).json({ success: false, error: 'User not found' });
    const user = await User.findByPk(id, { attributes: ['id', 'name', 'phone', 'companyName', 'isApproved'] });
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/auth/location
// Saves user's GPS coordinates to their profile
const saveUserLocation = async (req, res) => {
  try {
    const { latitude, longitude, locationLabel } = req.body;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
    await User.update({ latitude, longitude, locationLabel }, { where: { id: userId } });
    res.status(200).json({ success: true, message: 'Location saved' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /api/auth/profile
// Updates user's name and phone
const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
    
    const user = await AuthService.updateProfile(userId, req.body);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// GET /api/auth/profile
// Gets full profile with wallet transactions
const getProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
    
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    const { WalletTransaction } = require('../models');
    const walletTransactions = await WalletTransaction.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ success: true, data: { ...user.toJSON(), walletTransactions } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { register, login, getPendingB2B, approveB2BUser, saveUserLocation, updateProfile, getProfile };
