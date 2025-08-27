const { upload } = require('../config/cloudinary');
const rateLimit = require('express-rate-limit');

// Rate limiting for file uploads
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 upload requests per windowMs
  message: 'Too many upload attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Production upload middleware
const uploadMultipleImages = (req, res, next) => {
  upload.array('images', 5)(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          message: 'File too large. Maximum size is 10MB per file.' 
        });
      }
      
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ 
          message: 'Too many files. Maximum 5 files allowed.' 
        });
      }
      
      if (err.message.includes('Invalid file type')) {
        return res.status(400).json({ 
          message: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' 
        });
      }
      
      return res.status(400).json({ 
        message: 'Upload failed. Please try again.' 
      });
    }
    
    next();
  });
};

module.exports = {
  uploadMultipleImages,
  uploadLimiter
};
