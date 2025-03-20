const Student = require('../models/student.model');
const Event = require('../models/event.model');
const Class = require('../models/class.model'); // Add this import
const mongoose = require('mongoose');

class EventReportsService {
  // Helper function to get match stage
  static getMatchStage() {
    return { status: 'Approved' };
  }

  // NEW HELPER FUNCTION: Get class name map
  static async getStudentClassMap() {
    try {
      // Get all classes
      const classes = await Class.find().lean();
      console.log(`Found ${classes.length} classes`);
      
      // Create a map of class ID to class name
      const classIdToNameMap = new Map(
        classes.map(cls => [cls._id.toString(), cls.className])
      );
      
      // Get all students with their class references
      const students = await Student.find({
        'currentClass.ref': { $exists: true }
      }).lean();
      
      // Create a map of student ID to class name
      const studentToClassMap = new Map();
      
      students.forEach(student => {
        if (student.currentClass && student.currentClass.ref) {
          const classId = student.currentClass.ref.toString();
          const className = classIdToNameMap.get(classId) || 'Unknown Class';
          studentToClassMap.set(student._id.toString(), className);
        }
      });
      
      console.log(`Created student-class map with ${studentToClassMap.size} entries`);
      return studentToClassMap;
    } catch (error) {
      console.error('Error creating student class map:', error);
      return new Map();
    }
  }

  // Get total prize money won
  static async getTotalPrizeMoney() {
    try {
      console.log('Getting total prize money');
      const result = await Event.aggregate([
        { $match: this.getMatchStage() },
        { $group: { _id: null, totalPrizeMoney: { $sum: "$priceMoney" } } }
      ]);
      console.log('Total prize money result:', result);
      return result.length > 0 ? result[0].totalPrizeMoney : 0;
    } catch (error) {
      console.error('Error getting total prize money:', error);
      return 0;
    }
  }

  // Get total prize money won by class
  static async getTotalPrizeMoneyByClass(className) {
    try {
      console.log('Getting prize money for class:', className);
      
      const result = await Event.aggregate([
        { $match: this.getMatchStage() },
        {
          $lookup: {
            from: 'students',
            localField: 'submittedBy',
            foreignField: '_id',
            as: 'student'
          }
        },
        { $unwind: '$student' },
        { $match: { 'student.className': className } },
        { $group: { 
          _id: '$category', 
          totalPrizeMoney: { $sum: '$priceMoney' } 
        }}
      ]);
      
      console.log('Class prize money result:', result);
      return result;
    } catch (error) {
      console.error('Error getting class prize money:', error);
      return [];
    }
  }

  // Get top students - UPDATED
  static async getTopStudents(limit = 200) {
    try {
      console.log('Getting top students, limit:', limit);
      
      // Get the student-to-class mapping
      const studentClassMap = await this.getStudentClassMap();
      
      // Get student performance data
      const result = await Event.aggregate([
        { $match: this.getMatchStage() },
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
          $group: {
            _id: '$student._id',
            name: { $first: '$student.name' },
            registerNo: { $first: '$student.registerNo' },
            totalPoints: { $sum: '$pointsEarned' }
          }
        },
        { $sort: { totalPoints: -1 } },
        { $limit: limit }
      ]);
      
      // Add class names from our mapping
      const studentsWithClass = result.map(student => ({
        ...student,
        className: studentClassMap.get(student._id.toString()) || 'Unknown Class'
      }));
      
      // Calculate ranks
      let currentRank = 1;
      let currentPoints = null;
      let rankedStudents = [];
      
      studentsWithClass.forEach((student, index) => {
        if (student.totalPoints !== currentPoints) {
          currentPoints = student.totalPoints;
          currentRank = index + 1;
        }
        
        rankedStudents.push({
          "Rank": currentRank,
          "Register Number": student.registerNo || 'N/A',
          "Name": student.name || 'Unknown',
          "Class": student.className,
          "Points": student.totalPoints || 0
        });
      });
      
      console.log(`Returning ${rankedStudents.length} ranked students`);
      return rankedStudents;
    } catch (error) {
      console.error('Error getting top students:', error);
      return [];
    }
  }

  // Get top performers by category
  static async getTopPerformersByCategory(category, limit = 10) {
    try {
      console.log('Getting top performers for category:', category);
      
      const result = await Event.aggregate([
        { 
          $match: { 
            ...this.getMatchStage(),
            category
          } 
        },
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
          $group: {
            _id: '$student._id',
            name: { $first: '$student.name' },
            className: { $first: '$student.className' },
            totalPoints: { $sum: '$pointsEarned' }
          }
        },
        { $sort: { totalPoints: -1 } },
        { $limit: limit }
      ]);
      
      console.log(`Found ${result.length} top performers for ${category}`);
      return result;
    } catch (error) {
      console.error('Error getting top performers by category:', error);
      return [];
    }
  }

  // Get popular categories
  static async getPopularCategories(limit = 10) {
    try {
      console.log('Getting popular categories');
      
      const result = await Event.aggregate([
        { $match: this.getMatchStage() },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalPoints: { $sum: '$pointsEarned' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: limit },
        {
          $project: {
            name: '$_id',
            value: '$count',
            points: '$totalPoints',
            _id: 0
          }
        }
      ]);
      
      console.log('Popular categories result:', result);
      return result.length > 0 ? result : [{ name: 'No Data', value: 1 }];
    } catch (error) {
      console.error('Error getting popular categories:', error);
      return [{ name: 'Error', value: 1 }];
    }
  }

  // Get approval rates
  static async getApprovalRates() {
    try {
      console.log('Getting approval rates');
      
      // We need ALL events for this report, not just approved
      const result = await Event.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            status: '$_id',
            count: 1,
            _id: 0
          }
        }
      ]);
      
      console.log('Approval rates result:', result);
      
      // Format for pie chart
      return result.map(item => ({
        name: item.status,
        value: item.count
      }));
    } catch (error) {
      console.error('Error getting approval rates:', error);
      return [{ name: 'No Data', value: 1 }];
    }
  }

  // Get trends
  static async getTrends() {
    try {
      console.log('Getting event trends');
      
      const result = await Event.aggregate([
        { $match: this.getMatchStage() },
        {
          $group: {
            _id: {
              year: { $year: "$date" },
              month: { $month: "$date" }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        {
          $project: {
            date: {
              $dateToString: {
                format: "%Y-%m",
                date: {
                  $dateFromParts: {
                    year: "$_id.year",
                    month: "$_id.month",
                    day: 1
                  }
                }
              }
            },
            count: 1,
            _id: 0
          }
        }
      ]);
      
      console.log('Trends result:', result);
      return result;
    } catch (error) {
      console.error('Error getting trends:', error);
      return [];
    }
  }

  // Get class-wise participation
  static async getClassWiseParticipation(className) {
    try {
      console.log('Getting participation for class:', className);
      
      // We need ALL events for this one
      const result = await Event.aggregate([
        {
          $lookup: {
            from: 'students',
            localField: 'submittedBy',
            foreignField: '_id',
            as: 'student'
          }
        },
        { $unwind: '$student' },
        { $match: { 'student.className': className } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);
      
      console.log('Class participation result:', result);
      return result;
    } catch (error) {
      console.error('Error getting class participation:', error);
      return [];
    }
  }

  // Get class performance comparison - UPDATED
  static async getClassPerformance() {
    try {
      console.log('Getting class performance');
      
      // Get the student-to-class mapping
      const studentClassMap = await this.getStudentClassMap();
      
      // Get events with student data
      const approvedEvents = await Event.find(this.getMatchStage())
        .populate('submittedBy', 'name')
        .lean();
      
      console.log(`Found ${approvedEvents.length} approved events`);
      
      // Group events by class
      const classPerformance = new Map();
      
      for (const event of approvedEvents) {
        if (!event.submittedBy) continue;
        
        const studentId = event.submittedBy._id.toString();
        const className = studentClassMap.get(studentId) || 'Unknown Class';
        const points = event.pointsEarned || 0;
        
        if (!classPerformance.has(className)) {
          classPerformance.set(className, { totalPoints: 0, eventCount: 0 });
        }
        
        const data = classPerformance.get(className);
        data.totalPoints += points;
        data.eventCount += 1;
      }
      
      // Convert to the expected format
      const result = Array.from(classPerformance.entries())
        .map(([className, data]) => ({
          _id: className,
          totalPoints: data.totalPoints,
          eventCount: data.eventCount
        }))
        .sort((a, b) => b.totalPoints - a.totalPoints);
      
      console.log('Class performance result:', result);
      return result;
    } catch (error) {
      console.error('Error getting class performance:', error);
      return [];
    }
  }

  // Get student performance with class info
  static async getDetailedStudentPerformance(limit = 10) {
    try {
      console.log('Getting detailed student performance');
      
      const result = await Event.aggregate([
        { $match: this.getMatchStage() },
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
            _id: "$studentInfo._id",
            name: { $first: "$studentInfo.name" },
            className: { $first: "$studentInfo.className" },
            totalPoints: { $sum: "$pointsEarned" },
            eventCount: { $sum: 1 }
          }
        },
        { $sort: { totalPoints: -1 } },
        { $limit: limit }
      ]);
      
      console.log('Detailed student performance result:', result);
      return result;
    } catch (error) {
      console.error('Error getting detailed student performance:', error);
      return [];
    }
  }

  // Get category-wise performance by class - UPDATED
  static async getCategoryPerformanceByClass() {
    try {
      console.log('Getting category performance by class');
      
      // Get the student-to-class mapping
      const studentClassMap = await this.getStudentClassMap();
      
      // Get events with student data and category
      const approvedEvents = await Event.find(this.getMatchStage())
        .populate('submittedBy', 'name')
        .lean();
      
      // Group events by class and category
      const classCategoryPerformance = new Map();
      
      for (const event of approvedEvents) {
        if (!event.submittedBy) continue;
        
        const studentId = event.submittedBy._id.toString();
        const className = studentClassMap.get(studentId) || 'Unknown Class';
        const category = event.category;
        const points = event.pointsEarned || 0;
        
        if (!classCategoryPerformance.has(className)) {
          classCategoryPerformance.set(className, { totalPoints: 0, categories: new Map() });
        }
        
        const classData = classCategoryPerformance.get(className);
        classData.totalPoints += points;
        
        if (!classData.categories.has(category)) {
          classData.categories.set(category, { points: 0, count: 0 });
        }
        
        const categoryData = classData.categories.get(category);
        categoryData.points += points;
        categoryData.count += 1;
      }
      
      // Convert to the expected format
      const result = Array.from(classCategoryPerformance.entries())
        .map(([className, data]) => {
          const categories = Array.from(data.categories.entries())
            .map(([category, catData]) => ({
              category,
              points: catData.points,
              count: catData.count
            }));
          
          return {
            className,
            totalPoints: data.totalPoints,
            categories
          };
        })
        .sort((a, b) => b.totalPoints - a.totalPoints);
      
      // Transform data for frontend display with categories performance text
      const finalResult = result.map(item => ({
        ...item,
        categoriesPerformance: item.categories
          .sort((a, b) => b.points - a.points)
          .map(cat => `${cat.category}: ${cat.points} points (${cat.count} events)`)
      }));
      
      console.log('Category performance by class result:', finalResult);
      return finalResult;
    } catch (error) {
      console.error('Error getting category performance by class:', error);
      return [];
    }
  }

  // Get inactive students - UPDATED
  static async getInactiveStudents(inactivePeriodDays = 30) {
    try {
      console.log('Getting inactive students for', inactivePeriodDays, 'days');
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - inactivePeriodDays);
      
      // Get the student-to-class mapping
      const studentClassMap = await this.getStudentClassMap();
      
      // Get all students
      const students = await Student.find().lean();
      console.log(`Found ${students.length} total students`);
      
      // Get students with recent activity
      const activeStudentIds = await Event.distinct('submittedBy', {
        date: { $gte: cutoffDate }
      });
      console.log(`Found ${activeStudentIds.length} active students`);
      
      // Find inactive students
      const inactiveStudents = students.filter(student => 
        !activeStudentIds.some(id => id.equals(student._id))
      );
      
      // Get last activity dates for inactive students
      const studentLastActivities = await Event.aggregate([
        {
          $group: {
            _id: '$submittedBy',
            lastActivity: { $max: '$date' }
          }
        }
      ]);
      
      const activitiesMap = new Map(
        studentLastActivities.map(item => [item._id.toString(), item.lastActivity])
      );
      
      // Format the result with last activity date and proper class name
      const result = inactiveStudents.map(student => ({
        _id: student._id,
        name: student.name,
        className: studentClassMap.get(student._id.toString()) || 'Unknown Class',
        lastActivity: activitiesMap.get(student._id.toString()) || null
      }));
      
      console.log(`Returning ${result.length} inactive students`);
      return result;
    } catch (error) {
      console.error('Error getting inactive students:', error);
      return [];
    }
  }

  // Get class participation by category - UPDATED
  static async getClassParticipation() {
    try {
      console.log('Getting class participation by category');
      
      // Get the student-to-class mapping
      const studentClassMap = await this.getStudentClassMap();
      
      // Get events with student data
      const approvedEvents = await Event.find(this.getMatchStage())
        .populate('submittedBy', 'name')
        .lean();
      
      // Group events by class and category
      const classCategoryPerformance = new Map();
      
      for (const event of approvedEvents) {
        if (!event.submittedBy) continue;
        
        const studentId = event.submittedBy._id.toString();
        const className = studentClassMap.get(studentId) || 'Unknown Class';
        const category = event.category;
        const points = event.pointsEarned || 0;
        
        if (!classCategoryPerformance.has(className)) {
          classCategoryPerformance.set(className, { totalPoints: 0, categories: new Map() });
        }
        
        const classData = classCategoryPerformance.get(className);
        classData.totalPoints += points;
        
        if (!classData.categories.has(category)) {
          classData.categories.set(category, { participationCount: 0, points: 0 });
        }
        
        const categoryData = classData.categories.get(category);
        categoryData.participationCount += 1;
        categoryData.points += points;
      }
      
      // Convert to the expected format
      const result = Array.from(classCategoryPerformance.entries())
        .map(([className, data]) => {
          const categories = Array.from(data.categories.entries())
            .map(([category, catData]) => ({
              category,
              participationCount: catData.participationCount,
              points: catData.points
            }));
          
          return {
            className,
            totalPoints: data.totalPoints,
            categories
          };
        })
        .sort((a, b) => b.totalPoints - a.totalPoints);
      
      console.log('Class participation by category result:', result);
      return result;
    } catch (error) {
      console.error('Error getting class participation by category:', error);
      return [];
    }
  }
}

module.exports = EventReportsService;