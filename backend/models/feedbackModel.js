const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const feedbackSchema = new mongoose.Schema({
    student: { type: ObjectId, ref: 'student' }, // Optional: Reference to a student if needed
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const FeedbackModel = mongoose.model('Feedback', feedbackSchema);

module.exports = FeedbackModel;



