const Product = require('../models/Product');
const { sequelize } = require('../config/db');
const { Op } = require('sequelize');
const { bustCache } = require('../middleware/cacheMiddleware');

const getProducts = async (req, res) => {
  try {
    const { isAdmin } = req.query;
    const where = {};
    
    // Non-admin view (storefront) hides products that are ONLY for bulk
    if (isAdmin !== 'true') {
      where.isBulkOnly = false;
    }

    const products = await Product.findAll({ where });
    res.status(200).json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getBulkProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { isBulkOnly: true }
    });
    res.status(200).json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
const sanitizeData = (data) => {
  const fieldsToNull = [
    'storeId', 'categoryId', 'subCategoryId'
  ];
  fieldsToNull.forEach(field => {
    if (data[field] === "" || data[field] === "null" || data[field] === "undefined") {
      data[field] = null;
    }
  });

  // Convert numeric strings to numbers for safety
  const numericFields = ['b2cOldPrice', 'b2cNewPrice', 'b2bOldPrice', 'b2bNewPrice', 'stock', 'minB2BQty'];
  numericFields.forEach(field => {
    if (data[field] !== undefined && data[field] !== null && data[field] !== "") {
      data[field] = parseFloat(data[field]);
    } else {
       data[field] = null;
    }
  });

  if (data.isFlashSale === 'true') data.isFlashSale = true;
  else if (data.isFlashSale === 'false') data.isFlashSale = false;

  if (data.isBulkOnly === 'true') data.isBulkOnly = true;
  else if (data.isBulkOnly === 'false') data.isBulkOnly = false;

  // ratePerUnit is a plain string — clean empty to null
  if (data.ratePerUnit === "" || data.ratePerUnit === undefined) data.ratePerUnit = null;

  return data;
};

const createProduct = async (req, res) => {
  try {
    let data = { ...req.body };
    
    // Ensure b2bTiers is a string for TEXT column
    if (data.b2bTiers && typeof data.b2bTiers !== 'string') {
      data.b2bTiers = JSON.stringify(data.b2bTiers);
    }
    if (data.variants && typeof data.variants !== 'string') {
      data.variants = JSON.stringify(data.variants);
    }

    data = sanitizeData(data);

    // Handle Cloudinary Uploads or Manual URL
    if (req.files && req.files.length > 0) {
      const imageUrls = req.files.map(file => file.path).filter(path => !!path);
      if (imageUrls.length > 0) {
        data.images = JSON.stringify(imageUrls);
      }
    } else if (data.images && typeof data.images !== 'string') {
      // If it was passed as an array/object but not a file
      data.images = JSON.stringify(data.images);
    }

    const product = await Product.create(data);
    bustCache('/api');
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    console.error("Create Product Error:", err);
    res.status(400).json({ success: false, error: err.message });
  }
};


const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    let data = { ...req.body };

    // Ensure b2bTiers is a string for TEXT column
    if (data.b2bTiers && typeof data.b2bTiers !== 'string') {
      data.b2bTiers = JSON.stringify(data.b2bTiers);
    }
    if (data.variants && typeof data.variants !== 'string') {
      data.variants = JSON.stringify(data.variants);
    }

    data = sanitizeData(data);

    // Handle Cloudinary Uploads or Manual URL
    if (req.files && req.files.length > 0) {
      const imageUrls = req.files.map(file => file.path).filter(path => !!path);
      if (imageUrls.length > 0) {
        data.images = JSON.stringify(imageUrls);
      }
    } else if (data.images && typeof data.images !== 'string') {
      data.images = JSON.stringify(data.images);
    }

    await Product.update(data, { where: { id } });
    const updatedProduct = await Product.findByPk(id);
    if (updatedProduct) {
      bustCache('/api');
      return res.status(200).json({ success: true, data: updatedProduct });
    }
    return res.status(404).json({ success: false, error: 'Product not found' });
  } catch (err) {
    console.error("Update Product Error:", err);
    res.status(400).json({ success: false, error: err.message });
  }
};


const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.destroy({ where: { id } });
    if (deleted) {
      bustCache('/api');
      return res.status(200).json({ success: true, message: 'Product deleted successfully' });
    }
    throw new Error('Product not found');
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

const getHomeSections = async (req, res) => {
  try {
    // Highly optimized: fetch only the required 10 items per section directly from the database
    // using SQL level order and limit, reducing database memory usage and network overhead.
    const [latest, trending, mostPurchased] = await Promise.all([
      Product.findAll({
        where: { isBulkOnly: false },
        order: [['createdAt', 'DESC']],
        limit: 10
      }),
      Product.findAll({
        where: { isBulkOnly: false },
        order: [
          [sequelize.literal('ISNULL(rating)'), 'ASC'],
          ['rating', 'DESC']
        ],
        limit: 10
      }),
      Product.findAll({
        where: { isBulkOnly: false },
        order: [sequelize.literal('RAND()')],
        limit: 10
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        latest,
        trending,
        mostPurchased
      }
    });
  } catch (err) {
    console.error('❌ getHomeSections error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

const getRecommendations = async (req, res) => {
  try {
    const { cartItemIds } = req.query; // Exclude items already in cart
    const excludedIds = cartItemIds ? cartItemIds.split(',').filter(Boolean) : [];
    
    const whereClause = {
      isBulkOnly: false,
      ...(excludedIds.length > 0 ? { id: { [Op.notIn]: excludedIds } } : {})
    };

    // Recommend: high-rated products not already in cart
    // MySQL-compatible: ISNULL(rating) ASC puts NULLs last, then rating DESC
    const recommendations = await Product.findAll({
      where: whereClause,
      limit: 10,
      order: [
        [sequelize.literal('ISNULL(rating)'), 'ASC'],
        ['rating', 'DESC'],
        [sequelize.fn('RAND')]
      ]
    });

    res.status(200).json({ success: true, data: recommendations });
  } catch (err) {
    // Fallback: plain fetch if ORDER BY causes issues
    try {
      const recommendations = await Product.findAll({ limit: 10 });
      res.status(200).json({ success: true, data: recommendations });
    } catch (e) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};

const validateCartStock = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ success: false, error: 'Invalid items array' });
    }
    
    const results = [];
    
    for (const item of items) {
      if (item.isValuePack) continue;
      
      const product = await Product.findByPk(item.id || item.productId);
      if (!product) continue;
      
      let availableStock = Number(product.stock) || 0;
      let variantName = '';
      
      if (item.variantId && product.variants) {
         let variants = [];
         try { variants = JSON.parse(product.variants); } catch(e){}
         const v = variants.find(v => v.id === item.variantId);
         if (v) {
            availableStock = Number(v.stock) || 0;
            variantName = ` - ${v.size}`;
         }
      }
      
      if (item.quantity > availableStock) {
        results.push({
          id: item.id,
          variantId: item.variantId,
          availableStock,
          requested: item.quantity,
          name: product.name + variantName
        });
      }
    }
    
    res.status(200).json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { getProducts, getProductById, getBulkProducts, createProduct, updateProduct, deleteProduct, getHomeSections, getRecommendations, validateCartStock };
