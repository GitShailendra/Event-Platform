const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Force HTTPS in production
});

// Production-optimized storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: `events/${process.env.NODE_ENV}`, // Separate folders for dev/prod
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      public_id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      transformation: [
        { width: 1200, height: 800, crop: 'limit', quality: 'auto' },
        { fetch_format: 'auto' }, // Auto WebP conversion
        { flags: 'progressive' }, // Progressive JPEG
      ],
    };
  },
});

// Production upload configuration
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for production
    files: 5, // Max 5 files
  },
  fileFilter: (req, file, cb) => {
    // Strict file validation for production
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'), false);
    }
  }
});

module.exports = { cloudinary, upload };
