const reportService = require('../services/reportService');

// Handle API response
const handleResponse = (res, promise) => {
  promise
    .then(data => {
      res.status(200).json({
        success: true,
        data
      });
    })
    .catch(error => {
      console.error('Report error:', error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Failed to generate report'
      });
    });
};

// Total Prize Money Won
exports.getTotalPrizeMoney = (req, res) => {
  const filters = req.query;
  handleResponse(res, reportService.getTotalPrizeMoney(req.teacher, filters));
};

// Total Prize Money Won By Class
exports.getPrizeMoneyByClass = (req, res) => {
  const filters = req.query;
  handleResponse(res, reportService.getPrizeMoneyByClass(req.teacher, filters));
};

// Top Students
exports.getTopStudents = (req, res) => {
  const filters = req.query;
  const limit = parseInt(req.query.limit) || 10;
  handleResponse(res, reportService.getTopStudents(req.teacher, filters, limit));
};

// Top Performers By Category
exports.getTopPerformersByCategory = (req, res) => {
  const filters = req.query;
  const limit = parseInt(req.query.limit) || 5;
  handleResponse(res, reportService.getTopPerformersByCategory(req.teacher, filters, limit));
};

// Class-wise Participation
exports.getClassParticipation = (req, res) => {
  const filters = req.query;
  handleResponse(res, reportService.getClassParticipation(req.teacher, filters));
};

// Class Performance
exports.getClassPerformance = (req, res) => {
  const filters = req.query;
  handleResponse(res, reportService.getClassPerformance(req.teacher, filters));
};

// Detailed Student Performance
exports.getDetailedStudentPerformance = (req, res) => {
  const studentId = req.params.studentId;
  const filters = req.query;
  handleResponse(res, reportService.getDetailedStudentPerformance(req.teacher, studentId, filters));
};

// Category-wise Performance
exports.getCategoryPerformance = (req, res) => {
  const filters = req.query;
  handleResponse(res, reportService.getCategoryPerformance(req.teacher, filters));
};

// Inactive Students
exports.getInactiveStudents = (req, res) => {
  const filters = req.query;
  handleResponse(res, reportService.getInactiveStudents(req.teacher, filters));
};

// Available Classes for Reports
exports.getAvailableClasses = (req, res) => {
  handleResponse(res, reportService.getAvailableClassesForReports(req.teacher));
};

// Generate Report
exports.generateReport = async (req, res) => {
  try {
    // Get filters from request query
    const filters = {
      classId: req.query.classId,
      department: req.query.department,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      eventType: req.query.eventType
    };
    
    // Generate report data based on teacher role and filters
    const reportData = await reportService.generateReport(req.teacher, filters);
    
    res.status(200).json({
      success: true,
      data: reportData
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate report',
      error: error.message
    });
  }
};