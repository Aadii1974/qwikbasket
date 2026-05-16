const express = require('express');
const { getCategories, createCategory, updateCategory, deleteCategory, createSubCategory, getSubCategories } = require('../controllers/categoryController');
const router = express.Router();

const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { cache } = require('../middleware/cacheMiddleware');

router.get('/', cache(300), getCategories); // 5-min cache — categories rarely change
router.post('/', authMiddleware, adminMiddleware, upload.single('image'), createCategory);
router.put('/:id', authMiddleware, adminMiddleware, upload.single('image'), updateCategory);
router.delete('/:id', authMiddleware, adminMiddleware, deleteCategory);
router.get('/:categoryId/subcategories', getSubCategories);
router.post('/:categoryId/subcategories', authMiddleware, adminMiddleware, createSubCategory);


module.exports = router;
