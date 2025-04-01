const Feedback = require('../models/feedback.model');

const feedbackServices = {
    submitFeedback: async (comment, student, registerNo) => {
        try {
            const feedback = new Feedback({ 
                comment,
                student,
                registerNo
            });
            return await feedback.save();
        } catch (error) {
            throw error;
        }
    },

    getAllFeedback: async () => {
        try {
            return await Feedback.find()
                .select('comment createdAt')
                .sort({ createdAt: -1 });
        } catch (error) {
            throw error;
        }
    }
};

module.exports = feedbackServices;