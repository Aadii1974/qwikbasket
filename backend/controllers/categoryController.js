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
    const { name, slug, image, isVegetable } = req.body;
    let imageUrl = image;
    
    // Handle Cloudinary Upload
    if (req.file) {
      imageUrl = req.file.path;
    }

    const category = await Category.create({ 
      name, 
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'), 
      image: imageUrl, 
      isVegetable: isVegetable === 'true' || isVegetable === true 
    });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};


const getSubCategories = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const subCategories = await SubCategory.findAll({ where: { categoryId: categoryId } });
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
    
    const subcategory = await SubCategory.create({ name, slug, categoryId: categoryId });
    res.status(201).json({ success: true, data: subcategory });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    let data = { ...req.body };

    // Handle Cloudinary Upload
    if (req.file) {
      data.image = req.file.path;
    }

    if (data.isVegetable !== undefined) {
      data.isVegetable = data.isVegetable === 'true' || data.isVegetable === true;
    }

    const [updated] = await Category.update(data, { where: { id } });
    if (updated) {
      const updatedCategory = await Category.findByPk(id);
      return res.status(200).json({ success: true, data: updatedCategory });
    }
    throw new Error('Category not found');
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};


const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Category.destroy({ where: { id } });
    if (deleted) {
      return res.status(200).json({ success: true, message: 'Category deleted successfully' });
    }
    throw new Error('Category not found');
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getSubCategories,
  createSubCategory
};
