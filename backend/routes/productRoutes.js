const express = require('express');
const router = express.Router();
const { 
  getProducts, getProductById, getBulkProducts, createProduct, updateProduct, deleteProduct, 
  getHomeSections, getRecommendations, validateCartStock 
} = require('../controllers/productController');

const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { cache } = require('../middleware/cacheMiddleware');

router.get('/home-sections', cache(120), getHomeSections);
router.get('/recommendations', cache(60), getRecommendations);
router.get('/bulk', cache(120), getBulkProducts);
router.post('/validate-cart', validateCartStock);
router.get('/:id', cache(60), getProductById);
router.get('/', cache(60), getProducts);
router.post('/', authMiddleware, adminMiddleware, upload.array('images', 5), createProduct);
router.put('/:id', authMiddleware, adminMiddleware, upload.array('images', 5), updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, deleteProduct);

module.exports = router;
