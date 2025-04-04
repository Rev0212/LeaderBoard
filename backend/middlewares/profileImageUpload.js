const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create a factory function that returns middleware configured for a specific user type
const createProfileUploadMiddleware = (userType) => {
  // Create the appropriate upload directory based on user type
  const uploadDir = path.join(__dirname, `../uploads/profile/${userType}`);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Multer storage configuration
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  });

  const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG images are allowed!'), false);
    }
  };

  const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 0.5 * 1024 * 1024, // 0.5MB file limit
    },
  });

  return upload.single('profileImage');
};

module.exports = { createProfileUploadMiddleware };