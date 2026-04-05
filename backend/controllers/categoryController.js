const { Category, SubCategory } = require('../models');

const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [{ model: SubCategory, as: 'subcategories' }]
    });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, slug, image } = req.body;
    const category = await Category.create({ name, slug, image });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const getSubCategories = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const subCategories = await SubCategory.findAll({ where: { CategoryId: categoryId } });
    res.json({ success: true, data: subCategories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createSubCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, slug } = req.body;
    const category = await Category.findByPk(categoryId);
    if (!category) return res.status(404).json({ success: false, error: 'Category not found' });
    
    const subcategory = await SubCategory.create({ name, slug, CategoryId: categoryId });
    res.status(201).json({ success: true, data: subcategory });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = {
  getCategories,
  createCategory,
  getSubCategories,
  createSubCategory
};
