const Banner = require('../models/Banner');

exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.findAll({
      where: { isActive: true },
      order: [['order', 'ASC'], ['createdAt', 'DESC']],
    });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllBannersAdmin = async (req, res) => {
  try {
    const banners = await Banner.findAll({
      order: [['order', 'ASC'], ['createdAt', 'DESC']],
    });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createBanner = async (req, res) => {
  try {
    const banner = await Banner.create(req.body);
    res.status(201).json(banner);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Banner not found' });
    
    await banner.update(req.body);
    res.json(banner);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Banner not found' });
    
    await banner.destroy();
    res.json({ message: 'Banner deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
