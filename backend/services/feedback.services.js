const feedbackSchemaModel = require('../models/feedbackModel')

const feedbackServices = {
    submitFeedback: async (comment) => {
        try {
            const feedback = new feedbackSchemaModel({ comment });
            return await feedback.save();
        } catch (error) {
            throw error;
        }
    },

    getAllFeedback: async () => {
        try {
            return await feedbackSchemaModel.find().sort({ createdAt: -1 });
        } catch (error) {
            throw error;
        }
    }
};

module.exports = feedbackServices;