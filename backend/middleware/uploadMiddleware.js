const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinaryConfig');

// Check if Cloudinary is configured
const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;

let storage;

if (isCloudinaryConfigured) {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'products',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    },
  });
} else {
  console.warn("⚠️ Cloudinary keys missing in .env. Falling back to memory storage. Image uploads will NOT be saved to Cloudinary.");
  storage = multer.memoryStorage();
}

const upload = multer({ storage: storage });


module.exports = upload;
