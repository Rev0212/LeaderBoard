const mongoose = require('mongoose');
const Class = require('../models/class.model');
const Student = require('../models/student.model');
const Event = require('../models/event.model');
const Teacher = require('../models/teacher.model');

class FacultyReportService {
  /**
   * Get faculty's assigned class
   */
  static async getFacultyClass(teacher) {
    if (!teacher || !teacher._id) {
      throw new Error('Teacher information not provided');
    }

    // Faculty should have only one assigned class
    const facultyClass = await Class.findOne({ 
      facultyAssigned: teacher._id
    }).lean();

    if (!facultyClass) {
      throw new Error('No class assigned to this faculty');
    }

    return facultyClass;
  }

  /**
   * Get class performance overview
   */
  static async getClassOverview(teacher) {
    const facultyClass = await this.getFacultyClass(teacher);
    
    // Get students in the class
    const students = await Student.find({
      $or: [
        { 'currentClass.ref': facultyClass._id },
        { 'class': facultyClass._id }
      ]
    }).select('_id totalPoints eventsParticipated').lean();
    
    if (students.length === 0) {
      return {
        className: facultyClass.className,
        department: facultyClass.department,
        year: facultyClass.year,
        studentCount: 0,
        totalPoints: 0,
        averagePoints: 0,
        totalActivities: 0,
        activitiesPerStudent: 0,
        participationRate: 0
      };
    }

    // Calculate metrics
    const totalStudents = students.length;
    const totalPoints = students.reduce((sum, student) => sum + (student.totalPoints || 0), 0);
    const averagePoints = totalStudents > 0 ? Math.round((totalPoints / totalStudents) * 10) / 10 : 0;
    
    // Get total activities for this class
    const studentIds = students.map(s => s._id);
    const totalActivities = await Event.countDocuments({
      submittedBy: { $in: studentIds },
      status: 'Approved'
    });
    
    const activitiesPerStudent = totalStudents > 0 ? Math.round((totalActivities / totalStudents) * 10) / 10 : 0;
    
    // Calculate participation rate (students with at least one activity)
    const studentsWithActivities = students.filter(s => 
      s.eventsParticipated && s.eventsParticipated.length > 0
    ).length;
    
    const participationRate = totalStudents > 0 ? Math.round((studentsWithActivities / totalStudents) * 100) : 0;
    
    return {
      className: facultyClass.className,
      department: facultyClass.department,
      year: facultyClass.year,
      studentCount: totalStudents,
      totalPoints: totalPoints,
      averagePoints: averagePoints,
      totalActivities: totalActivities,
      activitiesPerStudent: activitiesPerStudent,
      participationRate: participationRate
    };
  }

  /**
   * Get department ranking
   */
  static async getDepartmentRanking(teacher) {
    const facultyClass = await this.getFacultyClass(teacher);
    
    // Get all classes in the same department and year
    const departmentClasses = await Class.find({ 
      department: facultyClass.department,
      year: facultyClass.year
    }).lean();
    
    // For each class, calculate the average points
    const classRankings = await Promise.all(departmentClasses.map(async (cls) => {
      // Get students in this class
      const students = await Student.find({
        $or: [
          { 'currentClass.ref': cls._id },
          { 'class': cls._id }
        ]
      }).select('totalPoints').lean();
      
      const studentCount = students.length;
      const totalPoints = students.reduce((sum, student) => sum + (student.totalPoints || 0), 0);
      const averagePoints = studentCount > 0 ? Math.round((totalPoints / studentCount) * 10) / 10 : 0;
      
      return {
        classId: cls._id,
        className: cls.className,
        averagePoints: averagePoints,
        totalPoints: totalPoints,
        studentCount: studentCount
      };
    }));
    
    // Sort by average points descending
    const sortedRankings = classRankings.sort((a, b) => b.averagePoints - a.averagePoints);
    
    // Find the rank of faculty's class
    const facultyClassRank = sortedRankings.findIndex(cls => 
      cls.classId.toString() === facultyClass._id.toString()
    ) + 1;
    
    return {
      facultyClass: {
        className: facultyClass.className,
        rank: facultyClassRank,
        outOf: sortedRankings.length,
        averagePoints: sortedRankings.find(c => 
          c.classId.toString() === facultyClass._id.toString()
        )?.averagePoints || 0
      },
      departmentRankings: sortedRankings
    };
  }

  /**
   * Get student analysis
   */
  static async getStudentAnalysis(teacher) {
    const facultyClass = await this.getFacultyClass(teacher);
    
    // Get students in the class
    const students = await Student.find({
      $or: [
        { 'currentClass.ref': facultyClass._id },
        { 'class': facultyClass._id }
      ]
    }).select('_id name registerNo totalPoints eventsParticipated').lean();
    
    if (students.length === 0) {
      return {
        topPerformers: [],
        atRiskStudents: [],
        pointsDistribution: [],
        mostImproved: []
      };
    }

    // Calculate top performers
    const topPerformers = [...students]
      .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
      .slice(0, 10)
      .map(s => ({
        _id: s._id,
        name: s.name,
        registerNo: s.registerNo,
        totalPoints: s.totalPoints || 0,
        activityCount: s.eventsParticipated?.length || 0
      }));
    
    // Get inactive students (no events in the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const studentIds = students.map(s => s._id);
    
    // Get latest event date for each student
    const studentLatestEvents = await Event.aggregate([
      {
        $match: {
          submittedBy: { $in: studentIds },
          status: 'Approved'
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: "$submittedBy",
          lastActivity: { $first: "$createdAt" }
        }
      }
    ]);
    
    // Map of student ID to last activity date
    const lastActivityMap = studentLatestEvents.reduce((map, item) => {
      map[item._id.toString()] = item.lastActivity;
      return map;
    }, {});
    
    // Find at-risk students (inactive for 30+ days)
    const atRiskStudents = students
      .filter(student => {
        const lastActivity = lastActivityMap[student._id.toString()];
        if (!lastActivity) return true; // No activity at all
        return new Date(lastActivity) < thirtyDaysAgo;
      })
      .map(s => ({
        _id: s._id,
        name: s.name,
        registerNo: s.registerNo,
        totalPoints: s.totalPoints || 0,
        lastActivity: lastActivityMap[s._id.toString()] || null,
        inactiveDays: lastActivityMap[s._id.toString()] 
          ? Math.floor((new Date() - new Date(lastActivityMap[s._id.toString()])) / (1000 * 60 * 60 * 24))
          : 30 // Default to 30 if no activity
      }));
    
    // Create points distribution
    const pointsRanges = [
      { range: '0-50', min: 0, max: 50, count: 0 },
      { range: '51-100', min: 51, max: 100, count: 0 },
      { range: '101-200', min: 101, max: 200, count: 0 },
      { range: '201-300', min: 201, max: 300, count: 0 },
      { range: '301+', min: 301, max: Infinity, count: 0 }
    ];
    
    students.forEach(student => {
      const points = student.totalPoints || 0;
      const range = pointsRanges.find(r => points >= r.min && points <= r.max);
      if (range) range.count++;
    });
    
    // Get most improved students (greatest point increase in last 30 days)
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const recentPointsGained = await Event.aggregate([
      {
        $match: {
          submittedBy: { $in: studentIds },
          status: 'Approved',
          createdAt: { $gte: oneMonthAgo }
        }
      },
      {
        $group: {
          _id: "$submittedBy",
          recentPoints: { $sum: "$pointsEarned" },
          recentActivities: { $sum: 1 }
        }
      },
      {
        $sort: { recentPoints: -1 }
      },
      {
        $limit: 10
      }
    ]);
    
    // Map student details to most improved
    const mostImproved = await Promise.all(
      recentPointsGained.map(async (item) => {
        const student = students.find(s => s._id.toString() === item._id.toString());
        if (!student) return null;
        
        return {
          _id: student._id,
          name: student.name,
          registerNo: student.registerNo,
          totalPoints: student.totalPoints || 0,
          recentPoints: item.recentPoints,
          recentActivities: item.recentActivities
        };
      })
    );
    
    return {
      topPerformers,
      atRiskStudents,
      pointsDistribution: pointsRanges,
      mostImproved: mostImproved.filter(Boolean)
    };
  }

  /**
   * Get category analysis
   */
  static async getCategoryAnalysis(teacher) {
    const facultyClass = await this.getFacultyClass(teacher);
    
    // Get students in the class
    const students = await Student.find({
      $or: [
        { 'currentClass.ref': facultyClass._id },
        { 'class': facultyClass._id }
      ]
    }).select('_id').lean();
    
    if (students.length === 0) {
      return {
        popularCategories: [],
        untappedCategories: [],
        categorySuccessRates: []
      };
    }

    const studentIds = students.map(s => s._id);
    
    // Get popular categories (by count)
    const popularCategories = await Event.aggregate([
      {
        $match: {
          submittedBy: { $in: studentIds },
          status: 'Approved'
        }
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalPoints: { $sum: "$pointsEarned" }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $project: {
          category: "$_id",
          count: 1,
          totalPoints: 1,
          _id: 0
        }
      }
    ]);
    
    // Get all possible categories from events
    const allCategories = await Event.distinct("category");
    
    // Identify untapped categories (less than 5% participation)
    const studentCount = students.length;
    const untappedCategories = allCategories
      .filter(category => {
        const categoryData = popularCategories.find(pc => pc.category === category);
        // Either no participation or very low participation
        return !categoryData || (categoryData.count / studentCount) < 0.05;
      })
      .map(category => {
        const categoryData = popularCategories.find(pc => pc.category === category) || 
          { category, count: 0, totalPoints: 0 };
        return categoryData;
      });
    
    // Calculate approval rates by category
    const categoryApprovalRates = await Event.aggregate([
      {
        $match: {
          submittedBy: { $in: studentIds }
        }
      },
      {
        $group: {
          _id: {
            category: "$category",
            status: "$status"
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.category",
          statuses: {
            $push: {
              status: "$_id.status",
              count: "$count"
            }
          },
          total: { $sum: "$count" }
        }
      }
    ]);
    
    // Calculate success rates
    const categorySuccessRates = categoryApprovalRates.map(cat => {
      const approved = cat.statuses.find(s => s.status === 'Approved')?.count || 0;
      const rejected = cat.statuses.find(s => s.status === 'Rejected')?.count || 0;
      const pending = cat.statuses.find(s => s.status === 'Pending')?.count || 0;
      
      return {
        category: cat._id,
        total: cat.total,
        approved,
        rejected,
        pending,
        approvalRate: cat.total > 0 ? Math.round((approved / cat.total) * 100) : 0
      };
    }).sort((a, b) => b.approvalRate - a.approvalRate);
    
    return {
      popularCategories,
      untappedCategories,
      categorySuccessRates
    };
  }

  /**
   * Get participation trends
   */
  static async getParticipationTrends(teacher, timeframe = 'monthly', months = 6) {
    const facultyClass = await this.getFacultyClass(teacher);
    
    // Get students in the class
    const students = await Student.find({
      $or: [
        { 'currentClass.ref': facultyClass._id },
        { 'class': facultyClass._id }
      ]
    }).select('_id').lean();
    
    if (students.length === 0) {
      return [];
    }

    const studentIds = students.map(s => s._id);
    
    // Calculate date ranges based on timeframe
    const endDate = new Date();
    const startDate = new Date();
    
    if (timeframe === 'weekly') {
      startDate.setDate(startDate.getDate() - (7 * months)); // Last X weeks
    } else {
      startDate.setMonth(startDate.getMonth() - months); // Last X months
    }
    
    // Prepare match condition
    const matchCondition = {
      submittedBy: { $in: studentIds },
      createdAt: { $gte: startDate, $lte: endDate }
    };
    
    // Group by week or month
    const groupStage = timeframe === 'weekly' 
      ? {
          $group: {
            _id: { 
              week: { $week: "$createdAt" }, 
              year: { $year: "$createdAt" } 
            },
            submissions: { $sum: 1 },
            approvals: { 
              $sum: { $cond: [{ $eq: ["$status", "Approved"] }, 1, 0] } 
            },
            points: { $sum: "$pointsEarned" },
            date: { $first: "$createdAt" }
          }
        }
      : {
          $group: {
            _id: { 
              month: { $month: "$createdAt" }, 
              year: { $year: "$createdAt" } 
            },
            submissions: { $sum: 1 },
            approvals: { 
              $sum: { $cond: [{ $eq: ["$status", "Approved"] }, 1, 0] } 
            },
            points: { $sum: "$pointsEarned" },
            date: { $first: "$createdAt" }
          }
        };
    
    // Get trends data
    const trends = await Event.aggregate([
      { $match: matchCondition },
      groupStage,
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.week": 1 } },
      { 
        $project: {
          period: timeframe === 'weekly'
            ? { $concat: [{ $toString: "$_id.week" }, "-", { $toString: "$_id.year" }] }
            : { $concat: [{ $toString: "$_id.month" }, "-", { $toString: "$_id.year" }] },
          submissions: 1,
          approvals: 1,
          points: 1,
          date: 1,
          _id: 0
        } 
      }
    ]);
    
    // Format date nicely for display
    return trends.map(t => ({
      ...t,
      displayDate: timeframe === 'weekly'
        ? `Week ${t.period.split('-')[0]}, ${t.period.split('-')[1]}`
        : new Date(parseInt(t.period.split('-')[1]), parseInt(t.period.split('-')[0]) - 1).toLocaleString('default', { month: 'short', year: 'numeric' })
    }));
  }

  /**
   * Get engagement opportunities
   */
  static async getEngagementOpportunities(teacher) {
    const facultyClass = await this.getFacultyClass(teacher);
    
    // Get students in the class
    const students = await Student.find({
      $or: [
        { 'currentClass.ref': facultyClass._id },
        { 'class': facultyClass._id }
      ]
    }).select('_id').lean();
    
    if (students.length === 0) {
      return {
        suggestedCategories: [],
        inactiveStudentCount: 0,
        recognitionOpportunities: []
      };
    }

    const studentIds = students.map(s => s._id);
    
    // Get current participation by category
    const categoryParticipation = await Event.aggregate([
      {
        $match: {
          submittedBy: { $in: studentIds },
          status: 'Approved'
        }
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          studentCount: { $addToSet: "$submittedBy" }
        }
      },
      {
        $project: {
          category: "$_id",
          count: 1,
          uniqueStudents: { $size: "$studentCount" },
          _id: 0
        }
      },
      {
        $sort: { uniqueStudents: 1, count: 1 }
      }
    ]);
    
    // Calculate suggested categories (low participation)
    const suggestedCategories = categoryParticipation
      .filter(cat => cat.uniqueStudents < (students.length * 0.3)) // Less than 30% of students
      .slice(0, 5) // Top 5 suggestions
      .map(cat => ({
        ...cat,
        participationRate: Math.round((cat.uniqueStudents / students.length) * 100)
      }));
    
    // Get count of inactive students (no events in the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Get active students in last 30 days
    const activeStudentsCount = await Event.aggregate([
      {
        $match: {
          submittedBy: { $in: studentIds },
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: "$submittedBy"
        }
      },
      {
        $count: "activeCount"
      }
    ]);
    
    const activeCount = activeStudentsCount[0]?.activeCount || 0;
    const inactiveStudentCount = students.length - activeCount;
    
    // Find students with significant achievements (top percentile)
    const topAchievers = await Student.find({
      _id: { $in: studentIds },
      totalPoints: { $gt: 0 }
    })
    .sort({ totalPoints: -1 })
    .limit(3)
    .select('_id name registerNo totalPoints')
    .lean();
    
    // Find students who have shown improvement recently
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const improvedStudents = await Event.aggregate([
      {
        $match: {
          submittedBy: { $in: studentIds },
          status: 'Approved',
          createdAt: { $gte: oneMonthAgo }
        }
      },
      {
        $group: {
          _id: "$submittedBy",
          recentPoints: { $sum: "$pointsEarned" },
          recentActivities: { $sum: 1 }
        }
      },
      {
        $match: {
          recentPoints: { $gt: 100 }, // Significant improvement
          recentActivities: { $gt: 3 } // Multiple activities
        }
      },
      {
        $sort: { recentPoints: -1 }
      },
      {
        $limit: 3
      }
    ]);
    
    // Get student details for improved students
    const improvedStudentDetails = await Promise.all(
      improvedStudents.map(async (item) => {
        const student = await Student.findById(item._id)
          .select('name registerNo totalPoints')
          .lean();
        
        if (!student) return null;
        
        return {
          _id: student._id,
          name: student.name,
          registerNo: student.registerNo,
          totalPoints: student.totalPoints,
          recentPoints: item.recentPoints,
          recentActivities: item.recentActivities
        };
      })
    );
    
    return {
      suggestedCategories,
      inactiveStudentCount,
      recognitionOpportunities: {
        topAchievers,
        improvedStudents: improvedStudentDetails.filter(Boolean)
      }
    };
  }
}

module.exports = FacultyReportService;