const express = require('express');
const { getCategories, createCategory, createSubCategory, getSubCategories } = require('../controllers/categoryController');
const router = express.Router();

router.get('/', getCategories);
router.post('/', createCategory);
router.get('/:categoryId/subcategories', getSubCategories);
router.post('/:categoryId/subcategories', createSubCategory);

module.exports = router;
