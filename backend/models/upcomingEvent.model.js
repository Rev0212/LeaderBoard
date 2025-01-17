const mongoose = require('mongoose');

const upcomingEventSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true,
    get: function(date) {
      return date.toISOString().split('T')[0];
    }
  },
  posterLink: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return v.includes('drive.google.com');
      },
      message: 'Poster link must be a Google Drive link'
    }
  },
  registrationLink: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('UpcomingEvent', upcomingEventSchema); 