const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');


// Public route to get active banners
router.get('/', bannerController.getBanners);

// Admin routes
router.get('/all', authMiddleware, adminMiddleware, bannerController.getAllBannersAdmin);
router.post('/', authMiddleware, adminMiddleware, bannerController.createBanner);
router.put('/:id', authMiddleware, adminMiddleware, bannerController.updateBanner);
router.delete('/:id', authMiddleware, adminMiddleware, bannerController.deleteBanner);


module.exports = router;
