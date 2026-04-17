const { Address } = require('../models');

const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.findAll({ 
      where: { userId: req.user.id },
      order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
    });
    res.status(200).json({ success: true, data: addresses });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const createAddress = async (req, res) => {
  try {
    const { fullName, phone, addressLine, landmark, pincode, city, state, isDefault } = req.body;
    
    // If setting as default, unset others first
    if (isDefault) {
      await Address.update({ isDefault: false }, { where: { userId: req.user.id } });
    }

    const newAddress = await Address.create({
      userId: req.user.id,
      fullName, phone, addressLine, landmark, pincode,
      city: city || 'Delhi/NCR',
      state: state || 'Delhi',
      isDefault: isDefault || false,
    });

    res.status(201).json({ success: true, data: newAddress });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { isDefault, fullName, phone, addressLine, landmark, pincode, city, state } = req.body;

    const address = await Address.findOne({ where: { id, userId: req.user.id } });
    if (!address) return res.status(404).json({ success: false, error: 'Address not found' });

    // If setting as default, unset all others first
    if (isDefault) {
      await Address.update({ isDefault: false }, { where: { userId: req.user.id } });
    }

    await address.update({
      ...(fullName !== undefined && { fullName }),
      ...(phone !== undefined && { phone }),
      ...(addressLine !== undefined && { addressLine }),
      ...(landmark !== undefined && { landmark }),
      ...(pincode !== undefined && { pincode }),
      ...(city !== undefined && { city }),
      ...(state !== undefined && { state }),
      ...(isDefault !== undefined && { isDefault }),
    });

    res.status(200).json({ success: true, data: address });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Address.destroy({ where: { id, userId: req.user.id } });
    if (!deleted) return res.status(404).json({ success: false, error: 'Address not found' });
    res.status(200).json({ success: true, message: 'Address deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { getAddresses, createAddress, updateAddress, deleteAddress };
