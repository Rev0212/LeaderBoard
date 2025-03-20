const RoleBasedEventReportsService = require('../services/roleBasedEventReports.service');
const { convertToCSV } = require('../utils/csvConverter');

class RoleBasedEventReportsController {
  /**
   * Get total prize money won
   */
  static async getTotalPrizeMoney(req, res, next) {
    try {
      console.log('Getting total prize money with teacher ID:', req.teacher._id);
      const totalPrizeMoney = await RoleBasedEventReportsService.getTotalPrizeMoney(
        req.teacher,
        req.query
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
      const prizeMoneyByClass = await RoleBasedEventReportsService.getTotalPrizeMoneyByClass(
        req.teacher,
        req.query
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
      const limit = parseInt(req.query.limit) || 10;
      
      const topStudents = await RoleBasedEventReportsService.getTopStudents(
        req.teacher,
        limit
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
      
      const topPerformers = await RoleBasedEventReportsService.getTopPerformersByCategory(
        req.teacher,
        category,
        req.query
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
      const limit = parseInt(req.query.limit) || 5;
      
      const popularCategories = await RoleBasedEventReportsService.getPopularCategories(
        req.teacher,
        limit
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
      
      const performance = await RoleBasedEventReportsService.getClassPerformance(
        req.teacher
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
      
      const performance = await RoleBasedEventReportsService.getDetailedStudentPerformance(
        req.teacher
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
      
      const performance = await RoleBasedEventReportsService.getCategoryPerformanceByClass(
        req.teacher
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
      const inactiveDays = parseInt(req.query.inactiveDays) || 30;
      
      const inactiveStudents = await RoleBasedEventReportsService.getInactiveStudents(
        req.teacher,
        inactiveDays
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
      
      const participation = await RoleBasedEventReportsService.getClassParticipation(
        req.teacher
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
      
      const approvalRates = await RoleBasedEventReportsService.getApprovalRates(
        req.teacher
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
      
      const trends = await RoleBasedEventReportsService.getTrends(
        req.teacher
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
      
      const classes = await RoleBasedEventReportsService.getAvailableClasses(
        req.teacher
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
      
      // Create a utility function to convert data to CSV if you don't have one
      if (typeof convertToCSV !== 'function') {
        // Simple implementation if convertToCSV is not available
        const convertToCSV = (data) => {
          if (!data || !data.length) return '';
          
          const headers = Object.keys(data[0]).join(',');
          const rows = data.map(item => 
            Object.values(item).map(val => 
              typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
            ).join(',')
          );
          
          return [headers, ...rows].join('\n');
        };
      }
      
      let data = [];
      
      // Get the appropriate data based on report type
      switch (reportType) {
        case 'top-students':
          data = await RoleBasedEventReportsService.getTopStudents(req.teacher, 100);
          break;
        case 'class-performance':
          data = await RoleBasedEventReportsService.getClassPerformance(req.teacher);
          break;
        case 'category-performance':
          data = await RoleBasedEventReportsService.getCategoryPerformanceByClass(req.teacher);
          break;
        case 'popular-categories':
          data = await RoleBasedEventReportsService.getPopularCategories(req.teacher, 50);
          break;
        case 'approval-rates':
          data = await RoleBasedEventReportsService.getApprovalRates(req.teacher);
          break;
        case 'inactive-students':
          data = await RoleBasedEventReportsService.getInactiveStudents(req.teacher);
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