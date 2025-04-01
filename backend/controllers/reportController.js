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

// Apply department filtering based on teacher role
const applyDepartmentFilter = (teacher, filters = {}) => {
  // Create a new filters object
  const enhancedFilters = { ...filters };
  
  // Apply department filter for non-admin/chairperson users
  if (teacher.department && teacher.role !== 'Admin' && teacher.role !== 'Chairperson') {
    console.log(`Applying department filter: ${teacher.department} for role: ${teacher.role}`);
    enhancedFilters.department = teacher.department;
  } else {
    console.log(`No department filter applied for role: ${teacher.role}`);
  }
  
  return enhancedFilters;
};

// Total Prize Money Won
exports.getTotalPrizeMoney = (req, res) => {
  const filters = applyDepartmentFilter(req.teacher, req.query);
  handleResponse(res, reportService.getTotalPrizeMoney(req.teacher, filters));
};

// Total Prize Money Won By Class
exports.getPrizeMoneyByClass = (req, res) => {
  const filters = applyDepartmentFilter(req.teacher, req.query);
  handleResponse(res, reportService.getPrizeMoneyByClass(req.teacher, filters));
};

// Top Students
exports.getTopStudents = (req, res) => {
  const filters = applyDepartmentFilter(req.teacher, req.query);
  const limit = parseInt(req.query.limit) || 10;
  handleResponse(res, reportService.getTopStudents(req.teacher, filters, limit));
};

// Top Performers By Category
exports.getTopPerformersByCategory = (req, res) => {
  const filters = applyDepartmentFilter(req.teacher, req.query);
  const limit = parseInt(req.query.limit) || 5;
  handleResponse(res, reportService.getTopPerformersByCategory(req.teacher, filters, limit));
};

// Class-wise Participation
exports.getClassParticipation = (req, res) => {
  const filters = applyDepartmentFilter(req.teacher, req.query);
  handleResponse(res, reportService.getClassParticipation(req.teacher, filters));
};

// Class Performance
exports.getClassPerformance = (req, res) => {
  const filters = applyDepartmentFilter(req.teacher, req.query);
  handleResponse(res, reportService.getClassPerformance(req.teacher, filters));
};

// Detailed Student Performance
exports.getDetailedStudentPerformance = (req, res) => {
  const studentId = req.params.studentId;
  const filters = applyDepartmentFilter(req.teacher, req.query);
  handleResponse(res, reportService.getDetailedStudentPerformance(req.teacher, studentId, filters));
};

// Category-wise Performance
exports.getCategoryPerformance = (req, res) => {
  const filters = applyDepartmentFilter(req.teacher, req.query);
  handleResponse(res, reportService.getCategoryPerformance(req.teacher, filters));
};

// Inactive Students
exports.getInactiveStudents = (req, res) => {
  const filters = applyDepartmentFilter(req.teacher, req.query);
  
  // Extract inactiveDays from query params or use default
  const inactiveDays = req.query.inactiveDays 
    ? parseInt(req.query.inactiveDays) 
    : 30;
  
  console.log(`Getting inactive students (${inactiveDays}+ days inactive) with filters:`, filters);
  
  // Pass parameters in correct order: teacher, inactiveDays, filters
  handleResponse(res, reportService.getInactiveStudents(req.teacher, inactiveDays, filters));
};

// Available Classes for Reports
exports.getAvailableClasses = (req, res) => {
  // Create filters object with department if needed
  const filters = applyDepartmentFilter(req.teacher, req.query);
  
  // Log the applied filters
  console.log('Getting available classes with filters:', filters);
  
  // Call the service with department filtering
  handleResponse(res, reportService.getAvailableClassesForReports(req.teacher, filters));
};

// Generate Report
exports.generateReport = async (req, res) => {
  try {
    // Get filters from request query
    let filters = {
      classId: req.query.classId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      eventType: req.query.eventType
    };
    
    // Apply department filter based on teacher role
    filters = applyDepartmentFilter(req.teacher, filters);
    
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