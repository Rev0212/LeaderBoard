const express = require('express');
const router = express.Router();
const upcomingEventController = require('../controllers/upcomingEvent.controller');
const authMiddleware = require('../middlewares/auth.middlewares');

router.post('/create', upcomingEventController.createEvent);
router.get('/', upcomingEventController.getEvents);
router.delete('/:id', upcomingEventController.deleteEvent);
router.patch('/:id', upcomingEventController.updateEvent);

module.exports = router; 