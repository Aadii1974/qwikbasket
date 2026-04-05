const AuthService = require('../services/authService');

const register = async (req, res) => {
  try {
    const result = await AuthService.signup(req.body);
    res.status(201).json({ success: true, message: 'User registered successfully', data: result.user, token: result.token });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const result = await AuthService.login(phone, password);
    res.status(200).json({ success: true, message: 'Login successful', ...result });
  } catch (err) {
    res.status(401).json({ success: false, error: err.message });
  }
};

module.exports = { register, login };
