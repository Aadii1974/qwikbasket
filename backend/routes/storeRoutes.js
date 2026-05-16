const express = require('express');
const router = express.Router();
const { getStores, createStore, updateStore, deleteStore } = require('../controllers/storeController');

const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { cache } = require('../middleware/cacheMiddleware');

router.get('/', cache(300), getStores);
router.post('/', authMiddleware, adminMiddleware, upload.single('image'), createStore);
router.put('/:id', authMiddleware, adminMiddleware, upload.single('image'), updateStore);
router.delete('/:id', authMiddleware, adminMiddleware, deleteStore);


module.exports = router;
