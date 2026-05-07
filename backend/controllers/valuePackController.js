const { ValuePack } = require('../models');

const getValuePacks = async (req, res) => {
  try {
    const packs = await ValuePack.findAll({
      where: req.user?.role === 'admin' ? {} : { isActive: true },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ success: true, data: packs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const createValuePack = async (req, res) => {
  try {
    const pack = await ValuePack.create(req.body);
    res.status(201).json({ success: true, data: pack });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

const updateValuePack = async (req, res) => {
  try {
    const pack = await ValuePack.findByPk(req.params.id);
    if (!pack) return res.status(404).json({ success: false, error: 'Pack not found' });
    await pack.update(req.body);
    res.status(200).json({ success: true, data: pack });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

const deleteValuePack = async (req, res) => {
  try {
    const pack = await ValuePack.findByPk(req.params.id);
    if (!pack) return res.status(404).json({ success: false, error: 'Pack not found' });
    await pack.destroy();
    res.status(200).json({ success: true, message: 'Pack deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { getValuePacks, createValuePack, updateValuePack, deleteValuePack };
