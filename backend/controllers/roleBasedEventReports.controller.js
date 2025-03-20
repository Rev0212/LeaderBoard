const RoleBasedEventReportsService = require('../services/roleBasedEventReports.service');
const { convertToCSV } = require('../utils/csvConverter');

class RoleBasedEventReportsController {
  /**
   * Get total prize money won
   */
  static async getTotalPrizeMoney(req, res, next) {
    try {
      console.log('Getting total prize money with teacher ID:', req.teacher._id);
      console.log('Query params:', req.query);
      
      const totalPrizeMoney = await RoleBasedEventReportsService.getTotalPrizeMoney(
        req.teacher,
        req.query // req.query already contains year if provided
      );
      
      res.status(200).json({ 
        success: true, 
        totalPrizeMoney 
      });
    } catch (error) {
      console.error('Error in getTotalPrizeMoney controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get total prize money'
      });
    }
  }

  /**
   * Get total prize money by class (HOD only)
   */
  static async getTotalPrizeMoneyByClass(req, res, next) {
    try {
      console.log('Getting prize money by class with teacher role:', req.teacher.role);
      console.log('Query params:', req.query);
      
      const prizeMoneyByClass = await RoleBasedEventReportsService.getTotalPrizeMoneyByClass(
        req.teacher,
        req.query // req.query already contains year if provided
      );
      
      res.status(200).json({ 
        success: true, 
        prizeMoneyByClass 
      });
    } catch (error) {
      console.error('Error in getTotalPrizeMoneyByClass controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get prize money by class'
      });
    }
  }

  /**
   * Get top students
   */
  static async getTopStudents(req, res, next) {
    try {
      console.log('Getting top students with teacher ID:', req.teacher._id);
      console.log('Query params:', req.query);
      
      const limit = parseInt(req.query.limit) || 10;
      
      // Create userFilters from query params
      const userFilters = {
        year: req.query.year ? parseInt(req.query.year) : null,
        classId: req.query.classId,
        department: req.query.department,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        category: req.query.category
      };
      
      const topStudents = await RoleBasedEventReportsService.getTopStudents(
        req.teacher,
        limit,
        userFilters
      );
      
      res.status(200).json({ 
        success: true, 
        topStudents 
      });
    } catch (error) {
      console.error('Error in getTopStudents controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get top students'
      });
    }
  }

  /**
   * Get top performers by category
   */
  static async getTopPerformersByCategory(req, res, next) {
    try {
      const { category } = req.params;
      console.log(`Getting top performers for category: ${category}`);
      console.log('Query params:', req.query);
      
      // Build user filters
      const userFilters = {
        year: req.query.year ? parseInt(req.query.year) : null,
        classId: req.query.classId,
        department: req.query.department,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };
      
      const topPerformers = await RoleBasedEventReportsService.getTopPerformersByCategory(
        req.teacher,
        category,
        userFilters
      );
      
      res.status(200).json({ 
        success: true, 
        topPerformers 
      });
    } catch (error) {
      console.error('Error in getTopPerformersByCategory controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get top performers'
      });
    }
  }

  /**
   * Get popular categories
   */
  static async getPopularCategories(req, res, next) {
    try {
      console.log('Getting popular categories');
      console.log('Query params:', req.query);
      
      const limit = parseInt(req.query.limit) || 5;
      
      // Create userFilters from query params
      const userFilters = {
        year: req.query.year ? parseInt(req.query.year) : null,
        classId: req.query.classId,
        department: req.query.department,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };
      
      const popularCategories = await RoleBasedEventReportsService.getPopularCategories(
        req.teacher,
        limit,
        userFilters
      );
      
      res.status(200).json({ 
        success: true, 
        popularCategories 
      });
    } catch (error) {
      console.error('Error in getPopularCategories controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get popular categories'
      });
    }
  }

  /**
   * Get class performance
   */
  static async getClassPerformance(req, res, next) {
    try {
      console.log('Getting class performance with teacher:', req.teacher.name);
      console.log('Query params:', req.query);
      
      const userFilters = {
        year: req.query.year ? parseInt(req.query.year) : null,
        department: req.query.department,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };
      
      const performance = await RoleBasedEventReportsService.getClassPerformance(
        req.teacher,
        userFilters
      );
      
      res.status(200).json({ 
        success: true, 
        performance 
      });
    } catch (error) {
      console.error('Error in getClassPerformance controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get class performance'
      });
    }
  }

  /**
   * Get detailed student performance
   */
  static async getDetailedStudentPerformance(req, res, next) {
    try {
      console.log('Getting detailed student performance');
      console.log('Query params:', req.query);
      
      const userFilters = {
        year: req.query.year ? parseInt(req.query.year) : null,
        classId: req.query.classId,
        department: req.query.department,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };
      
      const performance = await RoleBasedEventReportsService.getDetailedStudentPerformance(
        req.teacher,
        userFilters
      );
      
      res.status(200).json({ 
        success: true, 
        performance 
      });
    } catch (error) {
      console.error('Error in getDetailedStudentPerformance controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get detailed student performance'
      });
    }
  }

  /**
   * Get category-wise performance by class
   */
  static async getCategoryPerformanceByClass(req, res, next) {
    try {
      console.log('Getting category performance by class');
      console.log('Query params:', req.query);
      
      const userFilters = {
        year: req.query.year ? parseInt(req.query.year) : null,
        department: req.query.department,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        category: req.query.category
      };
      
      const performance = await RoleBasedEventReportsService.getCategoryPerformanceByClass(
        req.teacher,
        userFilters
      );
      
      res.status(200).json({ 
        success: true, 
        performance 
      });
    } catch (error) {
      console.error('Error in getCategoryPerformanceByClass controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get category performance by class'
      });
    }
  }

  /**
   * Get inactive students
   */
  static async getInactiveStudents(req, res, next) {
    try {
      console.log('Getting inactive students');
      console.log('Query params:', req.query);
      
      const inactiveDays = parseInt(req.query.inactiveDays) || 30;
      
      const userFilters = {
        year: req.query.year ? parseInt(req.query.year) : null,
        classId: req.query.classId,
        department: req.query.department
      };
      
      const inactiveStudents = await RoleBasedEventReportsService.getInactiveStudents(
        req.teacher,
        inactiveDays,
        userFilters
      );
      
      res.status(200).json({ 
        success: true, 
        inactiveStudents 
      });
    } catch (error) {
      console.error('Error in getInactiveStudents controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get inactive students'
      });
    }
  }

  /**
   * Get class participation
   */
  static async getClassParticipation(req, res, next) {
    try {
      console.log('Getting class participation');
      console.log('Query params:', req.query);
      
      const userFilters = {
        year: req.query.year ? parseInt(req.query.year) : null,
        department: req.query.department
      };
      
      const participation = await RoleBasedEventReportsService.getClassParticipation(
        req.teacher,
        userFilters
      );
      
      res.status(200).json({ 
        success: true, 
        participation 
      });
    } catch (error) {
      console.error('Error in getClassParticipation controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get class participation'
      });
    }
  }

  /**
   * Get approval rates
   */
  static async getApprovalRates(req, res, next) {
    try {
      console.log('Getting approval rates');
      console.log('Query params:', req.query);
      
      const userFilters = {
        year: req.query.year ? parseInt(req.query.year) : null,
        department: req.query.department,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };
      
      const approvalRates = await RoleBasedEventReportsService.getApprovalRates(
        req.teacher,
        userFilters
      );
      
      res.status(200).json({ 
        success: true, 
        approvalRates 
      });
    } catch (error) {
      console.error('Error in getApprovalRates controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get approval rates'
      });
    }
  }

  /**
   * Get event trends
   */
  static async getTrends(req, res, next) {
    try {
      console.log('Getting trends data');
      console.log('Query params:', req.query);
      
      const userFilters = {
        year: req.query.year ? parseInt(req.query.year) : null,
        department: req.query.department,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        category: req.query.category
      };
      
      const trends = await RoleBasedEventReportsService.getTrends(
        req.teacher,
        userFilters
      );
      
      res.status(200).json({ 
        success: true, 
        trends 
      });
    } catch (error) {
      console.error('Error in getTrends controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get trends'
      });
    }
  }

  /**
   * Get available classes (for filtering UI)
   */
  static async getAvailableClasses(req, res, next) {
    try {
      console.log('Getting available classes for teacher:', req.teacher.name);
      console.log('Query params:', req.query);
      
      // Extract year filter
      const yearFilter = req.query.year ? parseInt(req.query.year) : null;
      
      const classes = await RoleBasedEventReportsService.getAvailableClasses(
        req.teacher,
        yearFilter
      );
      
      res.status(200).json({ 
        success: true, 
        classes 
      });
    } catch (error) {
      console.error('Error in getAvailableClasses controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get available classes'
      });
    }
  }

  /**
   * Download a report as CSV
   */
  static async downloadReport(req, res, next) {
    try {
      const { reportType } = req.params;
      console.log('Downloading report:', reportType);
      console.log('Query params:', req.query);
      
      // Create userFilters object
      const userFilters = {
        year: req.query.year ? parseInt(req.query.year) : null,
        classId: req.query.classId,
        department: req.query.department,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        category: req.query.category
      };
      
      let data = [];
      
      // Get the appropriate data based on report type
      switch (reportType) {
        case 'top-students':
          data = await RoleBasedEventReportsService.getTopStudents(
            req.teacher, 
            100, 
            userFilters
          );
          break;
        case 'class-performance':
          data = await RoleBasedEventReportsService.getClassPerformance(
            req.teacher,
            userFilters
          );
          break;
        case 'category-performance':
          data = await RoleBasedEventReportsService.getCategoryPerformanceByClass(
            req.teacher,
            userFilters
          );
          break;
        case 'popular-categories':
          data = await RoleBasedEventReportsService.getPopularCategories(
            req.teacher, 
            50,
            userFilters
          );
          break;
        case 'approval-rates':
          data = await RoleBasedEventReportsService.getApprovalRates(
            req.teacher,
            userFilters
          );
          break;
        case 'inactive-students':
          data = await RoleBasedEventReportsService.getInactiveStudents(
            req.teacher,
            30, // Default inactive days
            userFilters
          );
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid report type'
          });
      }

      // Convert data to CSV
      const csv = await convertToCSV(data);
      
      // Send as downloadable file
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${reportType}-report.csv`);
      res.send(csv);
      
    } catch (error) {
      console.error('Error in downloadReport controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to download report'
      });
    }
  }
}

module.exports = RoleBasedEventReportsController;