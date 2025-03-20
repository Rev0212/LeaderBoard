const RoleBasedEventReportsService = require('../services/roleBasedEventReports.service');
const { convertToCSV } = require('../utils/csvConverter');

class RoleBasedEventReportsController {
  /**
   * Helper method to handle API responses
   */
  static async handleResponse(res, next, serviceMethod, ...args) {
    try {
      const data = await serviceMethod(...args);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error(`Error in ${serviceMethod.name}:`, error);
      next(error);
    }
  }

  /**
   * Get total prize money won
   */
  static async getTotalPrizeMoney(req, res, next) {
    try {
      const totalPrizeMoney = await RoleBasedEventReportsService.getTotalPrizeMoney(
        req.teacher, // This is set by the authTeacher middleware
        req.query
      );
      res.status(200).json({ success: true, totalPrizeMoney });
    } catch (error) {
      console.error('Error in getTotalPrizeMoney controller:', error);
      next(error);
    }
  }

  /**
   * Get total prize money by class
   */
  static async getTotalPrizeMoneyByClass(req, res, next) {
    try {
      const result = await RoleBasedEventReportsService.getTotalPrizeMoneyByClass(
        req.teacher, 
        req.query
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error('Error in getTotalPrizeMoneyByClass controller:', error);
      next(error);
    }
  }

  /**
   * Get top students
   */
  static async getTopStudents(req, res, next) {
    try {
      const topStudents = await RoleBasedEventReportsService.getTopStudents(
        req.teacher, 
        req.query
      );
      res.status(200).json({ success: true, topStudents });
    } catch (error) {
      console.error('Error in getTopStudents controller:', error);
      next(error);
    }
  }

  /**
   * Get top performers by category
   */
  static async getTopPerformersByCategory(req, res, next) {
    try {
      // Add the category from URL params to the query filters
      const filters = { 
        ...req.query,
        category: req.params.category 
      };
      
      const topPerformers = await RoleBasedEventReportsService.getTopPerformersByCategory(
        req.teacher, 
        filters
      );
      res.status(200).json({ success: true, topPerformers });
    } catch (error) {
      console.error('Error in getTopPerformersByCategory controller:', error);
      next(error);
    }
  }

  /**
   * Get popular categories
   */
  static async getPopularCategories(req, res, next) {
    try {
      const popularCategories = await RoleBasedEventReportsService.getPopularCategories(
        req.teacher, 
        req.query
      );
      res.status(200).json({ success: true, popularCategories });
    } catch (error) {
      console.error('Error in getPopularCategories controller:', error);
      next(error);
    }
  }

  /**
   * Get class performance
   */
  static async getClassPerformance(req, res, next) {
    try {
      const performance = await RoleBasedEventReportsService.getClassPerformance(
        req.teacher, 
        req.query
      );
      res.status(200).json({ success: true, performance });
    } catch (error) {
      console.error('Error in getClassPerformance controller:', error);
      next(error);
    }
  }

  /**
   * Get detailed student performance
   */
  static async getDetailedStudentPerformance(req, res, next) {
    try {
      const performance = await RoleBasedEventReportsService.getDetailedStudentPerformance(
        req.teacher, 
        req.query
      );
      res.status(200).json({ success: true, performance });
    } catch (error) {
      console.error('Error in getDetailedStudentPerformance controller:', error);
      next(error);
    }
  }

  /**
   * Get category-wise performance by class
   */
  static async getCategoryPerformanceByClass(req, res, next) {
    try {
      const performance = await RoleBasedEventReportsService.getCategoryPerformanceByClass(
        req.teacher, 
        req.query
      );
      res.status(200).json({ success: true, performance });
    } catch (error) {
      console.error('Error in getCategoryPerformanceByClass controller:', error);
      next(error);
    }
  }

  /**
   * Get inactive students
   */
  static async getInactiveStudents(req, res, next) {
    try {
      const inactiveStudents = await RoleBasedEventReportsService.getInactiveStudents(
        req.teacher, 
        req.query
      );
      res.status(200).json({ success: true, inactiveStudents });
    } catch (error) {
      console.error('Error in getInactiveStudents controller:', error);
      next(error);
    }
  }

  /**
   * Get class participation
   */
  static async getClassParticipation(req, res, next) {
    try {
      const participation = await RoleBasedEventReportsService.getClassParticipation(
        req.teacher, 
        req.query
      );
      res.status(200).json({ success: true, participation });
    } catch (error) {
      console.error('Error in getClassParticipation controller:', error);
      next(error);
    }
  }

  /**
   * Get approval rates
   */
  static async getApprovalRates(req, res, next) {
    try {
      const approvalRates = await RoleBasedEventReportsService.getApprovalRates(
        req.teacher, 
        req.query
      );
      res.status(200).json({ success: true, approvalRates });
    } catch (error) {
      console.error('Error in getApprovalRates controller:', error);
      next(error);
    }
  }

  /**
   * Get event trends
   */
  static async getTrends(req, res, next) {
    try {
      const trends = await RoleBasedEventReportsService.getTrends(
        req.teacher, 
        req.query
      );
      res.status(200).json({ success: true, trends });
    } catch (error) {
      console.error('Error in getTrends controller:', error);
      next(error);
    }
  }

  /**
   * Get available classes (for filtering UI)
   */
  static async getAvailableClasses(req, res, next) {
    try {
      const classes = await RoleBasedEventReportsService.getAvailableClasses(req.teacher);
      res.status(200).json({ success: true, classes });
    } catch (error) {
      console.error('Error in getAvailableClasses controller:', error);
      next(error);
    }
  }

  /**
   * Download a report as CSV
   */
  static async downloadReport(req, res, next) {
    try {
      const { reportType } = req.params;
      console.log('Downloading report:', reportType);
      
      let data;
      switch (reportType) {
        case 'top-students':
          data = await RoleBasedEventReportsService.getTopStudents(req.teacher, { ...req.query, limit: 200 });
          break;
        case 'class-performance':
          data = await RoleBasedEventReportsService.getClassPerformance(req.teacher, req.query);
          break;
        case 'category-performance':
          data = await RoleBasedEventReportsService.getCategoryPerformanceByClass(req.teacher, req.query);
          break;
        case 'popular-categories':
          data = await RoleBasedEventReportsService.getPopularCategories(req.teacher, { ...req.query, limit: 50 });
          break;
        case 'approval-rates':
          data = await RoleBasedEventReportsService.getApprovalRates(req.teacher, req.query);
          break;
        case 'inactive-students':
          data = await RoleBasedEventReportsService.getInactiveStudents(req.teacher, req.query);
          break;
        default:
          throw new Error('Invalid report type');
      }

      // Convert data to CSV format
      const csv = await convertToCSV(data);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${reportType}-report.csv`);
      res.send(csv);
    } catch (error) {
      console.error('Error in downloadReport controller:', error);
      next(error);
    }
  }
}

module.exports = RoleBasedEventReportsController;