const { ServiceablePincode } = require('../models');

const checkServiceability = async (req, res) => {
  try {
    const { pincode } = req.params;
    const serviceable = await ServiceablePincode.findOne({ where: { pincode, isActive: true } });
    
    if (serviceable) {
       res.status(200).json({ success: true, serviceable: true, data: serviceable });
    } else {
       res.status(200).json({ success: true, serviceable: false, message: 'Currently not serving this area' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getAdminPincodes = async (req, res) => {
  try {
    const pincodes = await ServiceablePincode.findAll({ order: [['createdAt', 'DESC']] });
    res.status(200).json({ success: true, data: pincodes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const addAdminPincode = async (req, res) => {
  try {
    const { pincode, areaName, city, state } = req.body;
    const newPincode = await ServiceablePincode.create({ pincode, areaName, city, state });
    res.status(201).json({ success: true, data: newPincode });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

const deleteAdminPincode = async (req, res) => {
  try {
    const { id } = req.params;
    await ServiceablePincode.destroy({ where: { id } });
    res.status(200).json({ success: true, message: 'Pincode removed' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { checkServiceability, getAdminPincodes, addAdminPincode, deleteAdminPincode };
