const EventReportsService = require('../services/eventReports.service');

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
}

module.exports = EventReportsController;