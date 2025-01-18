const EventReportsService = require('../services/eventReports.service');
const { convertToCSV } = require('../utils/csvConverter');

class EventReportsController {
  static async getTotalPrizeMoney(req, res, next) {
    try {
      const { filterType = 'monthly' } = req.query; // Default to 'monthly'
      const totalPrizeMoney = await EventReportsService.getTotalPrizeMoney(filterType);
      res.status(200).json({ totalPrizeMoney });
    } catch (error) {
      next(error);
    }
  }

  static async getTotalPrizeMoneyByClass(req, res, next) {
    const { className } = req.params;
    const { filterType = 'monthly' } = req.query; // Default to 'monthly'
    try {
      const totalPrizeMoney = await EventReportsService.getTotalPrizeMoneyByClass(className, filterType);
      res.status(200).json({ totalPrizeMoney });
    } catch (error) {
      next(error);
    }
  }

  static async getTopStudents(req, res, next) {
    const { filterType = 'monthly' } = req.query; // Default to 'monthly'
    const limit = parseInt(req.query.limit, 10) || 10;
    try {
      const topStudents = await EventReportsService.getTopStudents(limit, filterType);
      res.status(200).json({ topStudents });
    } catch (error) {
      next(error);
    }
  }

  static async getTopPerformersByCategory(req, res, next) {
    const { category } = req.params;
    const { filterType = 'monthly' } = req.query; // Default to 'monthly'
    const limit = parseInt(req.query.limit, 10) || 10;
    try {
      const topPerformers = await EventReportsService.getTopPerformersByCategory(category, limit, filterType);
      res.status(200).json({ topPerformers });
    } catch (error) {
      next(error);
    }
  }

  static async getPopularCategories(req, res, next) {
    const { filterType = 'monthly' } = req.query; // Default to 'monthly'
    const limit = parseInt(req.query.limit, 10) || 10;
    try {
      const popularCategories = await EventReportsService.getPopularCategories(limit, filterType);
      res.status(200).json({ popularCategories });
    } catch (error) {
      next(error);
    }
  }

  static async getApprovalRates(req, res, next) {
    const { filterType = 'monthly' } = req.query; // Default to 'monthly'
    try {
      const approvalRates = await EventReportsService.getApprovalRates(filterType);
      res.status(200).json({ approvalRates });
    } catch (error) {
      next(error);
    }
  }

  static async getTrends(req, res, next) {
    const { filterType = 'monthly' } = req.params; // Default to 'monthly'
    try {
      const trends = await EventReportsService.getTrends(filterType);
      res.status(200).json({ trends });
    } catch (error) {
      next(error);
    }
  }

  static async getClassWiseParticipation(req, res, next) {
    const { className } = req.params;
    const { filterType = 'monthly' } = req.query; // Default to 'monthly'
    try {
      const classWiseParticipation = await EventReportsService.getClassWiseParticipation(className, filterType);
      res.status(200).json({ classWiseParticipation });
    } catch (error) {
      next(error);
    }
  }

  static async getClassPerformance(req, res, next) {
    const { filterType = 'monthly' } = req.query;
    try {
      const performance = await EventReportsService.getClassPerformance(filterType);
      res.status(200).json({ performance });
    } catch (error) {
      next(error);
    }
  }

  static async getDetailedStudentPerformance(req, res, next) {
    const { filterType = 'monthly' } = req.query;
    const limit = parseInt(req.query.limit, 10) || 10;
    try {
      const performance = await EventReportsService.getDetailedStudentPerformance(limit, filterType);
      res.status(200).json({ performance });
    } catch (error) {
      next(error);
    }
  }

  static async getCategoryPerformanceByClass(req, res, next) {
    const { filterType = 'monthly' } = req.query;
    try {
      const performance = await EventReportsService.getCategoryPerformanceByClass(filterType);
      res.status(200).json({ performance });
    } catch (error) {
      next(error);
    }
  }

  static async downloadReport(req, res, next) {
    try {
      const { reportType } = req.params;
      const { filterType = 'monthly' } = req.query;
      
      let data;
      switch (reportType) {
        case 'top-students':
          data = await EventReportsService.getTopStudents(10, filterType);
          break;
        case 'class-performance':
          data = await EventReportsService.getClassPerformance(filterType);
          break;
        case 'category-performance':
          data = await EventReportsService.getCategoryPerformanceByClass(filterType);
          break;
        case 'popular-categories':
          data = await EventReportsService.getPopularCategories(10, filterType);
          break;
        case 'approval-rates':
          data = await EventReportsService.getApprovalRates(filterType);
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
      next(error);
    }
  }

  static async getInactiveStudents(req, res, next) {
    try {
      const { days = 30 } = req.query;
      const inactiveStudents = await EventReportsService.getInactiveStudents(parseInt(days));
      res.status(200).json({ inactiveStudents });
    } catch (error) {
      next(error);
    }
  }

  static async getClassParticipation(req, res, next) {
    try {
      const { filterType = 'monthly' } = req.query;
      const participation = await EventReportsService.getClassParticipation(filterType);
      res.status(200).json({ participation });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = EventReportsController;