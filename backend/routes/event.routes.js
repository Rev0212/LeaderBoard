// routes/event.routes.js
const express = require('express');
const eventController = require('../controllers/event.controller');
const authMiddleware = require('../middlewares/auth.middlewares');
const fileUpload = require('../controllers/fileUpload');
const { handleImageUpload } = require('../middlewares/imageUpload');
const { uploadImage } = require('../controllers/imageUpload.controller');
const FormFieldService = require('../services/formField.service');
const EnumConfig = require('../models/enumConfig.model');

const router = express.Router();

// Student submits an event
router.post('/submit', 
    authMiddleware.authStudent, 
    eventController.uploadEventFiles,
    eventController.submitEvent
);

// Teacher reviews an event
router.patch('/:id/review', authMiddleware.authTeacher, eventController.reviewEvent);

// Fetch event details
router.get('/', authMiddleware.authTeacher, eventController.getEvents);

router.post('/upload-pdf', fileUpload.uploadPDF);

router.patch('/edit/:id',authMiddleware.authTeacher,eventController.editEvent);

router.get('/student-events/:studentId', authMiddleware.authTeacher, eventController.getAllStudentEvents);

router.post('/upload-image', handleImageUpload, uploadImage);

// Get all form configuration (enums) for student
router.get('/form-configuration', authMiddleware.authStudent, async (req, res) => {
  try {
    // Fetch all enum values from the database
    const categories = await EnumConfig.findOne({ type: 'category' });
    const positionTypes = await EnumConfig.findOne({ type: 'positionSecured' });
    const eventScopes = await EnumConfig.findOne({ type: 'eventScope' });
    const eventLocations = await EnumConfig.findOne({ type: 'eventLocation' });
    const eventOrganizers = await EnumConfig.findOne({ type: 'eventOrganizer' });
    const participationTypes = await EnumConfig.findOne({ type: 'participationType' });

    res.status(200).json({
      success: true,
      data: {
        categories: categories ? categories.values : [],
        positionTypes: positionTypes ? positionTypes.values : [],
        eventScopes: eventScopes ? eventScopes.values : [],
        eventLocations: eventLocations ? eventLocations.values : [],
        eventOrganizers: eventOrganizers ? eventOrganizers.values : [],
        participationTypes: participationTypes ? participationTypes.values : [],
      }
    });
  } catch (error) {
    console.error('Error fetching form configuration:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch form configuration'
    });
  }
});

// Get form fields for a specific category
router.get('/form-fields/:category', authMiddleware.authStudent, async (req, res) => {
  try {
    const { category } = req.params;
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category parameter is required'
      });
    }
    
    const formFields = await FormFieldService.getFieldsForCategory(category);
    
    res.status(200).json({
      success: true,
      data: formFields
    });
  } catch (error) {
    console.error('Error fetching form fields:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch form fields'
    });
  }
});

module.exports = router;
