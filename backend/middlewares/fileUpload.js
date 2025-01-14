// middlewares/fileUpload.js

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create the upload directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads/pdf');
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
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file limit
    files: 1,
  },
});

const handlePDFUpload = (req, res, next) => {
  upload.single('pdfDocument')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'File too large',
          details: 'File size should not exceed 5MB',
        });
      }
      return res.status(400).json({
        error: 'File upload error',
        details: err.message,
      });
    } else if (err) {
      return res.status(400).json({
        error: 'Invalid file type',
        details: err.message,
      });
    }
    next();
  });
};

module.exports = { handlePDFUpload };
