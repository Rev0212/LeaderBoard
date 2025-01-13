// controllers/fileUpload.controller.js

const { handlePDFUpload } = require('../middlewares/fileUpload');

const uploadPDF = (req, res) => {
  handlePDFUpload(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        error: 'File upload error',
        details: err.message,
      });
    }

    // If file upload is successful
    res.status(200).json({
      message: 'PDF uploaded successfully',
      fileName: req.file.filename,
    });
  });
};

module.exports = { uploadPDF };
