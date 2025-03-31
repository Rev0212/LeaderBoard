const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedback.controller');

// Route to submit feedback
router.post('/', feedbackController.submitFeedback);

// Route to get all feedback
router.get('/', feedbackController.getFeedbacks);

module.exports = router;
