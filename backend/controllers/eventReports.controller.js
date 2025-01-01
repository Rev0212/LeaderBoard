const EventReportsService = require('../services/eventReports.services');

class EventReportsController {
  // Controller to get total prize money
  static async getTotalPrizeMoney(req, res) {
    try {
      const totalPrizeMoney = await EventService.getTotalPrizeMoney();
      res.status(200).json({ totalPrizeMoney });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Controller to get total prize money by class
  static async getTotalPrizeMoneyByClass(req, res) {
    const { className } = req.params;
    try {
      const totalPrizeMoney = await EventService.getTotalPrizeMoneyByClass(className);
      res.status(200).json({ totalPrizeMoney });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Controller to get top students
  static async getTopStudents(req, res) {
    try {
      const topStudents = await EventService.getTopStudents();
      res.status(200).json({ topStudents });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Controller to get top performers by category
  static async getTopPerformersByCategory(req, res) {
    const { category } = req.params;
    try {
      const topPerformers = await EventService.getTopPerformersByCategory(category);
      res.status(200).json({ topPerformers });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Controller to get popular categories
  static async getPopularCategories(req, res) {
    try {
      const popularCategories = await EventService.getPopularCategories();
      res.status(200).json({ popularCategories });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Controller to get approval rates
  static async getApprovalRates(req, res) {
    try {
      const approvalRates = await EventService.getApprovalRates();
      res.status(200).json({ approvalRates });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Controller to get trends
  static async getTrends(req, res) {
    const { filterType } = req.params;
    try {
      const trends = await EventService.getTrends(filterType);
      res.status(200).json({ trends });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Controller to get class-wise participation
  static async getClassWiseParticipation(req, res) {
    const { className } = req.params;
    try {
      const classWiseParticipation = await EventService.getClassWiseParticipation(className);
      res.status(200).json({ classWiseParticipation });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = EventReportsController;
