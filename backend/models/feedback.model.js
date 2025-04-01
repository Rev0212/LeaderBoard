const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  comment: {
    type: String,
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'student',  // Changed to lowercase to match other models
    required: true
  },
  registerNo: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Feedback', feedbackSchema);