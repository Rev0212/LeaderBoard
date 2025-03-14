const { validationResult } = require('express-validator');
const leaderboardService = require('../services/leaderboard.service');

// Get leaderboard with pagination and optional filtering
exports.getLeaderboard = async (req, res) => {
  try {
    const filterOptions = {
      department: req.query.department,
      course: req.query.course,
      year: req.query.year,
      section: req.query.section
    };
    
    const paginationOptions = {
      limit: req.query.limit || 10,
      page: req.query.page || 1,
      sortBy: 'totalPoints'
    };
    
    const result = await leaderboardService.getLeaderboard(
      filterOptions,
      paginationOptions
    );
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in getLeaderboard:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

// Get student's rank
exports.getStudentRank = async (req, res) => {
  try {
    const studentId = req.student._id; // Extract student ID from middleware
    
    const rank = await leaderboardService.getStudentRank(studentId);
    
    res.status(200).json({
      success: true,
      rank: rank
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving student rank',
      error: error.message
    });
  }
};

// Get department leaderboard
exports.getDepartmentLeaderboard = async (req, res) => {
  try {
    const { department } = req.params;
    
    const paginationOptions = {
      limit: req.query.limit || 10,
      page: req.query.page || 1,
      sortBy: req.query.sortBy || 'points'
    };
    
    const result = await leaderboardService.getDepartmentLeaderboard(
      department,
      paginationOptions
    );
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in getDepartmentLeaderboard:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
