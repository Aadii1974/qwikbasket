const express = require('express');
const router = express.Router();
const { getValuePacks, createValuePack, updateValuePack, deleteValuePack } = require('../controllers/valuePackController');
const { authMiddleware, adminMiddleware, optionalAuth } = require('../middleware/authMiddleware');

router.get('/', optionalAuth, getValuePacks);
router.post('/', authMiddleware, adminMiddleware, createValuePack);
router.put('/:id', authMiddleware, adminMiddleware, updateValuePack);
router.delete('/:id', authMiddleware, adminMiddleware, deleteValuePack);

module.exports = router;
