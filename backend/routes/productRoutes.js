const express = require('express');
const router = express.Router();
const { 
  getProducts, createProduct, updateProduct, deleteProduct, 
  getHomeSections, getRecommendations 
} = require('../controllers/productController');

const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/home-sections', getHomeSections);
router.get('/recommendations', getRecommendations);
router.get('/', getProducts);
router.post('/', authMiddleware, adminMiddleware, upload.array('images', 5), createProduct);
router.put('/:id', authMiddleware, adminMiddleware, upload.array('images', 5), updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, deleteProduct);

module.exports = router;
