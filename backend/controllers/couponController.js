const { Coupon } = require('../models');

exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.findAll();
    res.status(200).json({ success: true, data: coupons });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPublicCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.findAll({ where: { isPublic: true, isActive: true } });
    res.status(200).json({ success: true, data: coupons });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({ where: { code, isActive: true } });
    if (!coupon) {
      return res.status(404).json({ success: false, error: 'Invalid or inactive coupon code' });
    }
    res.status(200).json({ success: true, data: coupon });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByPk(id);
    if (!coupon) return res.status(404).json({ success: false, error: 'Coupon not found' });
    await coupon.update(req.body);
    res.status(200).json({ success: true, data: coupon });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    await Coupon.destroy({ where: { id } });
    res.status(200).json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
