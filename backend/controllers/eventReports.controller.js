const EventReportsService = require('../services/eventReports.service');
const { convertToCSV } = require('../utils/csvConverter');

class EventReportsController {
  static async getTotalPrizeMoney(req, res, next) {
    try {
      const totalPrizeMoney = await EventReportsService.getTotalPrizeMoney();
      res.status(200).json({ totalPrizeMoney });
    } catch (error) {
      console.error('Error in getTotalPrizeMoney controller:', error);
      next(error);
    }
  }

  static async getTotalPrizeMoneyByClass(req, res, next) {
    const { className } = req.params;
    try {
      const totalPrizeMoney = await EventReportsService.getTotalPrizeMoneyByClass(className);
      res.status(200).json({ totalPrizeMoney });
    } catch (error) {
      console.error('Error in getTotalPrizeMoneyByClass controller:', error);
      next(error);
    }
  }

  static async getTopStudents(req, res, next) {
    const limit = parseInt(req.query.limit, 10) || 10;
    try {
      const topStudents = await EventReportsService.getTopStudents(limit);
      res.status(200).json({ topStudents });
    } catch (error) {
      console.error('Error in getTopStudents controller:', error);
      next(error);
    }
  }

  static async getTopPerformersByCategory(req, res, next) {
    const { category } = req.params;
    const limit = parseInt(req.query.limit, 10) || 10;
    try {
      const topPerformers = await EventReportsService.getTopPerformersByCategory(category, limit);
      res.status(200).json({ topPerformers });
    } catch (error) {
      console.error('Error in getTopPerformersByCategory controller:', error);
      next(error);
    }
  }

  static async getPopularCategories(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 10;
      const popularCategories = await EventReportsService.getPopularCategories(limit);
      console.log('Sending popular categories response:', { popularCategories });
      res.json({ popularCategories });
    } catch (error) {
      console.error('Error in getPopularCategories controller:', error);
      next(error);
    }
  }

  static async getApprovalRates(req, res, next) {
    try {
      const approvalRates = await EventReportsService.getApprovalRates();
      res.status(200).json({ approvalRates });
    } catch (error) {
      console.error('Error in getApprovalRates controller:', error);
      next(error);
    }
  }

  static async getTrends(req, res, next) {
    try {
      const trends = await EventReportsService.getTrends();
      res.status(200).json({ trends });
    } catch (error) {
      console.error('Error in getTrends controller:', error);
      next(error);
    }
  }

  static async getClassWiseParticipation(req, res, next) {
    const { className } = req.params;
    try {
      const classWiseParticipation = await EventReportsService.getClassWiseParticipation(className);
      res.status(200).json({ classWiseParticipation });
    } catch (error) {
      console.error('Error in getClassWiseParticipation controller:', error);
      next(error);
    }
  }

  static async getClassPerformance(req, res, next) {
    try {
      const performance = await EventReportsService.getClassPerformance();
      console.log('Sending class performance response:', { performance });
      res.json({ performance });
    } catch (error) {
      console.error('Error in getClassPerformance controller:', error);
      next(error);
    }
  }

  static async getDetailedStudentPerformance(req, res, next) {
    const limit = parseInt(req.query.limit, 10) || 10;
    try {
      const performance = await EventReportsService.getDetailedStudentPerformance(limit);
      res.status(200).json({ performance });
    } catch (error) {
      console.error('Error in getDetailedStudentPerformance controller:', error);
      next(error);
    }
  }

  static async getCategoryPerformanceByClass(req, res, next) {
    try {
      const performance = await EventReportsService.getCategoryPerformanceByClass();
      console.log('Sending category performance response:', { performance });
      res.json({ performance });
    } catch (error) {
      console.error('Error in getCategoryPerformanceByClass controller:', error);
      next(error);
    }
  }

  static async downloadReport(req, res, next) {
    try {
      const { reportType } = req.params;
      console.log('Downloading report:', reportType);
      
      let data;
      switch (reportType) {
        case 'top-students':
          data = await EventReportsService.getTopStudents(200);
          break;
        case 'class-performance':
          data = await EventReportsService.getClassPerformance();
          break;
        case 'category-performance':
          data = await EventReportsService.getCategoryPerformanceByClass();
          break;
        case 'popular-categories':
          data = await EventReportsService.getPopularCategories(50);
          break;
        case 'approval-rates':
          data = await EventReportsService.getApprovalRates();
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

  static async getInactiveStudents(req, res, next) {
    try {
      const { days = 30 } = req.query;
      const inactiveStudents = await EventReportsService.getInactiveStudents(parseInt(days));
      res.status(200).json({ inactiveStudents });
    } catch (error) {
      console.error('Error in getInactiveStudents controller:', error);
      next(error);
    }
  }

  static async getClassParticipation(req, res, next) {
    try {
      const participation = await EventReportsService.getClassParticipation();
      res.status(200).json({ participation });
    } catch (error) {
      console.error('Error in getClassParticipation controller:', error);
      next(error);
    }
  }
}

module.exports = EventReportsController;