const UpcomingEvent = require('../models/upcomingEvent.model');

const upcomingEventController = {
  // Create new upcoming event
  createEvent: async (req, res) => {
    console.log('Received create event request');
    console.log('Request body:', req.body);
    console.log('Auth header:', req.headers.authorization);
    
    try {
      const { eventName, date, posterLink, registrationLink, content } = req.body;
      
      console.log('Parsed data:', {
        eventName,
        date,
        posterLink,
        registrationLink,
        content
      });
      
      const newEvent = new UpcomingEvent({
        eventName,
        date,
        posterLink,
        registrationLink,
        content
      });

      console.log('Created new event object:', newEvent);

      const savedEvent = await newEvent.save();
      console.log('Saved event:', savedEvent);
      
      res.status(201).json({ message: 'Event created successfully', event: savedEvent });
    } catch (error) {
      console.error('Error creating event:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ 
        error: error.message,
        stack: error.stack,
        validationErrors: error.errors 
      });
    }
  },

  // Get all upcoming events
  getEvents: async (req, res) => {
    // console.log('Fetching upcoming events...');
    try {
      const events = await UpcomingEvent.find()
        .sort({ date: 1 })
        .exec();
    //   console.log('Found events:', events);
      res.status(200).json(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Delete an event
  deleteEvent: async (req, res) => {
    try {
      const { id } = req.params;
      await UpcomingEvent.findByIdAndDelete(id);
      res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update an event
  updateEvent: async (req, res) => {
    try {
      const { id } = req.params;
      const { eventName, date, posterLink, registrationLink, content } = req.body;
      
      const updatedEvent = await UpcomingEvent.findByIdAndUpdate(
        id,
        { eventName, date, posterLink, registrationLink, content },
        { new: true, runValidators: true }
      );

      if (!updatedEvent) {
        return res.status(404).json({ error: 'Event not found' });
      }

      res.status(200).json(updatedEvent);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = upcomingEventController; 