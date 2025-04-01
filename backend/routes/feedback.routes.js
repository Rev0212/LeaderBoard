const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedback.controller');
const authMiddleware = require('../middlewares/auth.middlewares');

// Protect the route with student authentication middleware
router.post('/', authMiddleware.authStudent, feedbackController.submitFeedback);

// Route to get all feedback
router.get('/', feedbackController.getAllFeedback);

module.exports = router;
