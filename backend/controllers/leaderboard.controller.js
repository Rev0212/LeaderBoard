const { validationResult } = require('express-validator');
const leaderboardService = require('../services/leaderboard.service');

// Get leaderboard with pagination and optional filtering
exports.getLeaderboard = async (req, res) => {
  try {
    // If useStudentContext is true and student is authenticated, use student's context
    if (req.query.useStudentContext === 'true' && req.student) {
      const paginationOptions = {
        limit: req.query.limit || 10,
        page: req.query.page || 1,
        sortBy: 'totalPoints',
        search: req.query.search // Add search parameter
      };
      
      const result = await leaderboardService.getStudentContextLeaderboard(
        req.student,
        paginationOptions
      );
      
      return res.status(200).json({
        success: true,
        ...result,
        context: {
          year: req.student.currentClass?.year,
          department: req.student.department
        }
      });
    }
    
    // Otherwise use the provided filters
    const filterOptions = {
      department: req.query.department,
      course: req.query.course,
      year: req.query.year,
      section: req.query.section,
      search: req.query.search // Add search parameter
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
    
    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error in getLeaderboard:', error);
    return res.status(500).json({ 
      success: false,
      message: error.message || 'Internal server error' 
    });
  }
};

// Get student's rank
exports.getStudentRank = async (req, res) => {
  try {
    if (!req.student) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }
    
    const studentId = req.student._id;
    
    const rankInfo = await leaderboardService.getStudentRank(studentId);
    
    res.status(200).json({
      success: true,
      ...rankInfo,
      context: {
        year: req.student.currentClass?.year,
        department: req.student.department
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error retrieving student rank'
    });
  }
};

// New method for student context leaderboard
exports.getMyContextLeaderboard = async (req, res) => {
  try {
    if (!req.student) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }
    
    const paginationOptions = {
      limit: req.query.limit || 10,
      page: req.query.page || 1,
      sortBy: 'totalPoints',
      search: req.query.search // Add search parameter
    };
    
    const result = await leaderboardService.getStudentContextLeaderboard(
      req.student,
      paginationOptions
    );
    
    return res.status(200).json({
      success: true,
      ...result,
      context: {
        year: req.student.currentClass?.year,
        department: req.student.department
      }
    });
  } catch (error) {
    console.error('Error in getMyContextLeaderboard:', error);
    return res.status(500).json({ 
      success: false,
      message: error.message || 'Internal server error' 
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
