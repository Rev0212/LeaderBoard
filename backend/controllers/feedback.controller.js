const FeedbackModel = require('../models/feedbackModel');

// Submit feedback
exports.submitFeedback = async (req, res) => {
    const { comment } = req.body;

    try {
        if (!comment) {
            return res.status(400).json({ message: 'Comment is required.' });
        }

        const feedback = new FeedbackModel({ comment });
        await feedback.save();

        return res.status(201).json({ message: 'Feedback submitted successfully!', feedback });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        return res.status(500).json({ message: 'Failed to submit feedback.' });
    }
};

// Get all feedback
exports.getFeedbacks = async (req, res) => {
    try {
        const feedbacks = await FeedbackModel.find().sort({ createdAt: -1 });
        return res.status(200).json(feedbacks);
    } catch (error) {
        console.error('Error fetching feedbacks:', error);
        return res.status(500).json({ message: 'Failed to load feedbacks.' });
    }
};
