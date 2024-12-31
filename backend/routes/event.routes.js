const express = require('express');
const eventController = require('../controllers/event.controller');
const authMiddleware = require('../middlewares/auth.middlewares');

const router = express.Router();

// Student submits an event
router.post('/submit', authMiddleware.authStudent, eventController.submitEvent);

// Teacher reviews an event
router.patch('/:id/review', authMiddleware.authTeacher, eventController.reviewEvent);

// Fetch event details
router.get('/',authMiddleware.authTeacher,eventController.getEvents)



module.exports = router;
