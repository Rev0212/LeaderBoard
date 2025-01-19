const Student = require('../models/student.model');
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
  static async getTopStudents(limit = 200, filterType) {
    try {
      // Get ALL students sorted by total points
      const allStudents = await Student.find({})
        .sort({ totalPoints: -1 })
        .select('name registerNo totalPoints')
        .lean();

      // Calculate global ranks (using same logic as leaderboard)
      let currentRank = 1;
      let currentPoints = null;
      let rankedStudents = [];
      
      allStudents.forEach((student) => {
        if (student.totalPoints !== currentPoints) {
          currentPoints = student.totalPoints;
          currentRank = rankedStudents.length + 1;
        }

        rankedStudents.push({
          "Rank": currentRank,
          "Register Number": student.registerNo,
          "Name": student.name,
          "Points": student.totalPoints || 0
        });

        // Only break after we've included all students of the current rank
        if (currentRank > limit && student.totalPoints !== currentPoints) {
          return false; // Break the forEach loop
        }
      });

      return rankedStudents;
    } catch (error) {
      throw error;
    }
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
      // console.log('Student Performance Result:', result);
      return result;
    } catch (error) {
      console.error('Student Performance Error:', error);
      throw new Error(`Error getting student performance: ${error.message}`);
    }
  }

  // Get category-wise performance by class
  static async getCategoryPerformanceByClass(filterType) {
    try {
      const result = await Event.aggregate([
        {
          $lookup: {
            from: "students",
            localField: "submittedBy",
            foreignField: "_id",
            as: "studentDetails"
          }
        },
        {
          $unwind: "$studentDetails"
        },
        {
          $lookup: {
            from: "classes",
            localField: "studentDetails.class",
            foreignField: "_id",
            as: "classDetails"
          }
        },
        {
          $unwind: "$classDetails"
        },
        {
          $group: {
            _id: {
              className: "$classDetails.className",
              category: "$category"
            },
            totalPoints: { $sum: "$pointsEarned" },
            participation: { $count: {} }
          }
        },
        {
          $group: {
            _id: "$_id.className",
            totalPoints: { $sum: "$totalPoints" },
            categoriesPerformance: {
              $push: {
                category: "$_id.category",
                points: "$totalPoints",
                participations: "$participation"
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            className: "$_id",
            totalPoints: 1,
            categoriesPerformance: {
              $map: {
                input: "$categoriesPerformance",
                as: "categoryPerf",
                in: {
                  $concat: [
                    "$$categoryPerf.category", ": ",
                    { $toString: "$$categoryPerf.points" }, " points (",
                    { $toString: "$$categoryPerf.participations" }, " participations)"
                  ]
                }
              }
            }
          }
        }
      ]);

      return result;
    } catch (error) {
      console.error('Category Performance Error:', error);
      throw new Error(`Error getting category performance by class: ${error.message}`);
    }
  }

  // Get inactive students
  static async getInactiveStudents(inactivePeriodDays = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - inactivePeriodDays);

      const inactiveStudents = await Student.aggregate([
        {
          $lookup: {
            from: 'events',
            localField: '_id',
            foreignField: 'submittedBy',
            as: 'events'
          }
        },
        {
          $lookup: {
            from: 'classes',
            localField: 'class',
            foreignField: '_id',
            as: 'classInfo'
          }
        },
        {
          $unwind: '$classInfo'
        },
        {
          $project: {
            name: 1,
            className: '$classInfo.className',
            lastActivity: { $max: '$events.date' }
          }
        },
        {
          $match: {
            $or: [
              { lastActivity: { $lt: cutoffDate } },
              { lastActivity: null }
            ]
          }
        },
        {
          $sort: { lastActivity: 1, name: 1 }
        }
      ]);

      return inactiveStudents;
    } catch (error) {
      console.error('Error getting inactive students:', error);
      throw error;
    }
  }

  // Get class participation by category
  static async getClassParticipation(filterType) {
    try {
      const matchStage = this.getMatchStage(filterType);
      const participation = await Event.aggregate([
        { $match: matchStage },
        {
          $lookup: {
            from: 'students',
            localField: 'submittedBy',
            foreignField: '_id',
            as: 'student'
          }
        },
        { $unwind: '$student' },
        {
          $lookup: {
            from: 'classes',
            localField: 'student.class',
            foreignField: '_id',
            as: 'classInfo'
          }
        },
        { $unwind: '$classInfo' },
        {
          $group: {
            _id: {
              className: '$classInfo.className',
              category: '$category'
            },
            participationCount: { $sum: 1 },
            totalPoints: { $sum: '$pointsEarned' }
          }
        },
        {
          $group: {
            _id: '$_id.className',
            className: { $first: '$_id.className' },
            totalPoints: { $sum: '$totalPoints' },
            categories: {
              $push: {
                category: '$_id.category',
                participationCount: '$participationCount',
                points: '$totalPoints'
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            className: 1,
            totalPoints: 1,
            categories: 1
          }
        },
        { $sort: { totalPoints: -1 } }
      ]);

      return participation;
    } catch (error) {
      console.error('Error getting class participation:', error);
      throw error;
    }
  }
}

module.exports = EventReportsService;