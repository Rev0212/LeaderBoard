// routes/event.routes.js
const express = require('express');
const eventController = require('../controllers/event.controller');
const authMiddleware = require('../middlewares/auth.middlewares');
const fileUpload = require('../controllers/fileUpload');

const router = express.Router();

// Student submits an event
router.post('/submit', authMiddleware.authStudent, eventController.submitEvent);

// Teacher reviews an event
router.patch('/:id/review', authMiddleware.authTeacher, eventController.reviewEvent);

// Fetch event details
router.get('/', authMiddleware.authTeacher, eventController.getEvents);

router.post('/upload-pdf', fileUpload.uploadPDF);

module.exports = router;