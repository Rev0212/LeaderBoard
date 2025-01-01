const eventModel = require('../models/event.model');
const studentModel = require('../models/student.model');
const mongoose = require('mongoose');

class EventReportsService {
  // Helper function to get match stage based on filter type
  static getMatchStage(filterType) {
    let matchStage;
    switch (filterType) {
      case 'monthly':
        matchStage = { $expr: { $eq: [{ $month: "$date" }, { $month: new Date() }] } };
        break;
      case 'quarterly':
        matchStage = { $expr: { $in: [{ $quarter: "$date" }, [1, 2, 3, 4]] } };
        break;
      case 'half-yearly':
        matchStage = { $expr: { $in: [{ $halfYear: "$date" }, [1, 2]] } };
        break;
      case 'yearly':
        matchStage = { $expr: { $eq: [{ $year: "$date" }, { $year: new Date() }] } };
        break;
      default:
        throw new Error("Invalid filterType");
    }
    return matchStage;
  }

  // Get total prize money won
  static async getTotalPrizeMoney(filterType) {
    const matchStage = this.getMatchStage(filterType);
    const result = await Event.aggregate([
      { $match: matchStage },
      { $group: { _id: null, totalPrizeMoney: { $sum: "$priceMoney" } } }
    ]);
    return result[0].totalPrizeMoney;
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

  // Get monthly, quarterly, half-yearly, and yearly trends
  static async getTrends(filterType) {
    const matchStage = this.getMatchStage(filterType);
    const result = await Event.aggregate([
      { $match: matchStage },
      { $group: { _id: "$year", count: { $sum: 1 } } }
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
