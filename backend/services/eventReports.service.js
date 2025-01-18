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
    
    try {
      const result = await Event.aggregate([
        { 
          $match: { 
            ...matchStage, 
            "submittedBy.class.className": className 
          }
        },
        { 
          $group: { 
            _id: "$category", 
            totalPrizeMoney: { $sum: "$priceMoney" } 
          } 
        }
      ]);
      return result;
    } catch (error) {
      throw new Error(`Error getting total prize money: ${error.message}`);
    }
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
    console.log(category, limit, filterType);
    const matchStage = this.getMatchStage(filterType);
    const result = await Event.aggregate([
      { $match: { ...matchStage,  category } },
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
  // Get class performance comparison
  static async getClassPerformance(filterType) {
    const matchStage = this.getMatchStage(filterType);
    try {
      const result = await Event.aggregate([
        { $match: matchStage },
        {
          $lookup: {
            from: "students",
            localField: "submittedBy", 
            foreignField: "_id",
            as: "student"
          }
        },
        { $unwind: "$student" },
        {
          $lookup: {
            from: "classes",
            localField: "student.class",
            foreignField: "_id",
            as: "classInfo"
          }
        },
        { $unwind: "$classInfo" },
        {
          $group: {
            _id: "$classInfo.className", // Group by className instead of name
            totalPoints: { $sum: "$pointsEarned" },
            totalEvents: { $sum: 1 },
            averagePoints: { $avg: "$pointsEarned" }
          }
        },
        { $sort: { totalPoints: -1 } },
        {
          $project: {
            _id: 1,
            totalPoints: 1,
            totalEvents: 1,
            averagePoints: { $round: ["$averagePoints", 2] }
          }
        }
      ]);

      // Add rank field to results
      const rankedResults = result.map((item, index) => ({
        ...item,
        rank: index + 1
      }));

      // console.log('Class Performance Result:', rankedResults);
      return rankedResults;
    } catch (error) {
      console.error('Class Performance Error:', error);
      throw new Error(`Error getting class performance: ${error.message}`);
    }
  }

  // Get student performance with class info
  static async getDetailedStudentPerformance(limit = 10, filterType) {
    const matchStage = this.getMatchStage(filterType);
    try {
      const result = await Event.aggregate([
        { $match: matchStage },
        {
          $lookup: {
            from: "students",
            localField: "submittedBy",
            foreignField: "_id",
            as: "studentInfo"
          }
        },
        { $unwind: "$studentInfo" },
        {
          $group: {
            _id: {
              studentId: "$studentInfo._id",
              name: "$studentInfo.name",
              className: "$studentInfo.class.name"
            },
            totalPoints: { $sum: "$pointsEarned" }
          }
        },
        { $sort: { totalPoints: -1 } },
        { $limit: limit }
      ]);
      console.log('Student Performance Result:', result);
      return result;
    } catch (error) {
      console.error('Student Performance Error:', error);
      throw new Error(`Error getting student performance: ${error.message}`);
    }
  }

  // Get category-wise performance by class
  static async getCategoryPerformanceByClass(filterType) {
    const matchStage = this.getMatchStage(filterType);
    try {
      const result = await Event.aggregate([
        { $match: matchStage },
        {
          $lookup: {
            from: "students",
            localField: "submittedBy",
            foreignField: "_id",
            as: "student"
          }
        },
        { $unwind: "$student" },
        {
          $lookup: {
            from: "classes",
            localField: "student.class",
            foreignField: "_id",
            as: "classInfo"
          }
        },
        { $unwind: "$classInfo" },
        // First group by class and category
        {
          $group: {
            _id: {
              classId: "$classInfo._id",
              className: "$classInfo.className", // Using className instead of name
              category: "$category"
            },
            totalPoints: { $sum: "$pointsEarned" },
            participationCount: { $sum: 1 }
          }
        },
        // Then group by class
        {
          $group: {
            _id: {
              classId: "$_id.classId",
              className: "$_id.className"
            },
            totalPoints: { $sum: "$totalPoints" },
            categories: {
              $push: {
                category: "$_id.category",
                points: "$totalPoints",
                participationCount: "$participationCount"
              }
            }
          }
        },
        // Sort by total points
        { $sort: { totalPoints: -1 } },
        // Final structure
        {
          $project: {
            _id: 0,
            className: { $ifNull: ["$_id.className", "N/A"] }, // Provide default value if className is null
            totalPoints: 1,
            categories: {
              $sortArray: {
                input: "$categories",
                sortBy: { points: -1 }
              }
            }
          }
        }
      ]);

      // Add additional error checking for empty or null classNames
      const processedResult = result.map(item => ({
        ...item,
        className: item.className || 'N/A'
      }));

      return processedResult;
    } catch (error) {
      console.error('Category Performance Error:', error);
      throw new Error(`Error getting category performance by class: ${error.message}`);
    }
  }
}

module.exports = EventReportsService;