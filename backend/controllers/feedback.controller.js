const Feedback = require('../models/feedback.model');

// Submit feedback
exports.submitFeedback = async (req, res) => {
  try {
    // req.student should be populated by your authentication middleware
    if (!req.student) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const { comment } = req.body;
    
    if (!comment || comment.trim() === '') {
      return res.status(400).json({ success: false, message: 'Feedback comment is required' });
    }

    const feedback = new Feedback({
      comment,
      student: req.student._id,
      registerNo: req.student.registerNo
    });

    await feedback.save();

    return res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    console.error('Error in submitFeedback:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all feedback (for admin)
exports.getAllFeedback = async (req, res) => {
  try {
    // Include student information in the response
    const feedback = await Feedback.find()
      .populate('student', 'name registerNo email') // Populate student details
      .sort({ createdAt: -1 });
    
    return res.status(200).json({
      success: true,
      feedback
    });
  } catch (error) {
    console.error('Error in getAllFeedback:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
