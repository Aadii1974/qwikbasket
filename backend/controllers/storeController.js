const { Store } = require('../models');

const getStores = async (req, res) => {
  try {
    const stores = await Store.findAll();
    res.status(200).json({ success: true, data: stores });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const createStore = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.image = req.file.path;
    }
    const store = await Store.create(data);
    res.status(201).json({ success: true, data: store });
  } catch (err) {

    res.status(400).json({ success: false, error: err.message });
  }
};

const updateStore = async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    if (req.file) {
      data.image = req.file.path;
    }
    const [updated] = await Store.update(data, { where: { id } });
    if (updated) {

      const updatedStore = await Store.findByPk(id);
      return res.status(200).json({ success: true, data: updatedStore });
    }
    throw new Error('Store not found');
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

const deleteStore = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Store.destroy({ where: { id } });
    if (deleted) {
      return res.status(200).json({ success: true, message: 'Store deleted successfully' });
    }
    throw new Error('Store not found');
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

module.exports = { getStores, createStore, updateStore, deleteStore };
