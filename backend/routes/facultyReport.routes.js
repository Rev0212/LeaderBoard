const express = require('express');
const router = express.Router();
const facultyReportController = require('../controllers/facultyReport.controller');
// Fix the path to match your project structure
const { authTeacher } = require('../middlewares/auth.middlewares');

// Apply authentication middleware to all routes
router.use(authTeacher);

// Class Performance Overview
router.get('/class-overview', facultyReportController.getClassOverview);

// Department Ranking
router.get('/department-ranking', facultyReportController.getDepartmentRanking);

// Student Analysis
router.get('/student-analysis', facultyReportController.getStudentAnalysis);

// Category Analysis
router.get('/category-analysis', facultyReportController.getCategoryAnalysis);

// Temporal Analysis
router.get('/participation-trends', facultyReportController.getParticipationTrends);

// Engagement Opportunities
router.get('/engagement-opportunities', facultyReportController.getEngagementOpportunities);

module.exports = router;