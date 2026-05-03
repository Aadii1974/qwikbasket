const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinaryConfig');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Cloudinary storage for generic uploads (hero images, promo cards, etc.)
const isConfigured = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;

let storage;
if (isConfigured) {
  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'qwikbasket-home',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    },
  });
} else {
  storage = multer.memoryStorage();
}

const upload = multer({ storage });

/**
 * POST /api/upload
 * Generic image upload for admin-managed content (hero carousel, promo cards, etc.)
 * Returns: { urls: [url1, url2, ...] }
 */
router.post('/', authMiddleware, adminMiddleware, upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files uploaded' });
    }

    const urls = req.files.map(file => {
      if (file.path) return file.path; // Cloudinary URL
      if (file.secure_url) return file.secure_url;
      // Fallback for memory storage (should not happen in prod)
      return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    });

    res.json({ success: true, urls, url: urls[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
