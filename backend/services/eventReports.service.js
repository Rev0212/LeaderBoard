const Event = require('../models/event.model');

class EventReportsService {
  // Helper function to get match stage based on filter type
  static getMatchStage(filterType) {
    const now = new Date();
    switch (filterType) {
      case 'monthly':
        return { $expr: { $eq: [{ $month: "$date" }, now.getMonth() + 1] } };
      case 'quarterly':
        return { $expr: { $in: [{ $month: "$date" }, [1, 2, 3, 4]] } }; // Example: Adjust quarters based on logic
      case 'yearly':
        return { $expr: { $eq: [{ $year: "$date" }, now.getFullYear()] } };
      default:
        throw new Error('Invalid filterType');
    }
  }

  // Get total prize money won
  static async getTotalPrizeMoney(filterType) {
    const matchStage = this.getMatchStage(filterType);
    const result = await Event.aggregate([
      { $match: matchStage },
      { $group: { _id: null, totalPrizeMoney: { $sum: "$priceMoney" } } }
    ]);
    return result[0]?.totalPrizeMoney || 0;
  }

  // Get total prize money won by class
  static async getTotalPrizeMoneyByClass(className, filterType) {
    const matchStage = this.getMatchStage(filterType);
    const result = await Event.aggregate([
      { $match: { ...matchStage, "submittedBy.class.name": className } },
      { $group: { _id: "$category", totalPrizeMoney: { $sum: "$priceMoney" } } }
    ]);
    return result;
  }

  // Get top students
  static async getTopStudents(limit = 10, filterType) {
    const matchStage = this.getMatchStage(filterType);
    const result = await Event.aggregate([
      { $match: matchStage },
      { $group: { _id: "$submittedBy", totalPoints: { $sum: "$pointsEarned" } } },
      { $sort: { totalPoints: -1 } },
      { $limit: limit }
    ]);
    return result;
  }

  // Get top performers by category
  static async getTopPerformersByCategory(category, limit = 10, filterType) {
    const matchStage = this.getMatchStage(filterType);
    const result = await Event.aggregate([
      { $match: { ...matchStage, category } },
      { $group: { _id: "$submittedBy", totalPoints: { $sum: "$pointsEarned" } } },
      { $sort: { totalPoints: -1 } },
      { $limit: limit }
    ]);
    return result;
  }

  // Get popular categories
  static async getPopularCategories(limit = 10, filterType) {
    const matchStage = this.getMatchStage(filterType);
    const result = await Event.aggregate([
      { $match: matchStage },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit }
    ]);
    return result;
  }

  // Get approval rates
  static async getApprovalRates(filterType) {
    const matchStage = this.getMatchStage(filterType);
    const result = await Event.aggregate([
      { $match: matchStage },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    return result;
  }

  // Get trends
  static async getTrends(filterType) {
    const matchStage = this.getMatchStage(filterType);
    const result = await Event.aggregate([
      { $match: matchStage },
      { $group: { _id: { year: { $year: "$date" } }, count: { $sum: 1 } } }
    ]);
    return result;
  }

  // Get class-wise participation
  static async getClassWiseParticipation(className, filterType) {
    const matchStage = this.getMatchStage(filterType);
    const result = await Event.aggregate([
      { $match: { ...matchStage, "submittedBy.class.name": className } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    return result;
  }
}

module.exports = EventReportsService;
