const path = require('path');

const uploadImage = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No image file provided',
      });
    }

    // Send the filename and path back to the client
    // Update the path to include certificateproof instead of images
    res.status(200).json({
      message: 'Image uploaded successfully',
      fileName: req.file.filename,
      filePath: `/uploads/certificateproof/${req.file.filename}`
    });
  } catch (error) {
    res.status(500).json({
      error: 'Image upload failed',
      details: error.message,
    });
  }
};

module.exports = { uploadImage };