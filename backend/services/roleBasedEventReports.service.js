const Student = require('../models/student.model');
const Event = require('../models/event.model');
const Class = require('../models/class.model');
const Teacher = require('../models/teacher.model');
const mongoose = require('mongoose');

class RoleBasedEventReportsService {
  /**
   * Get role-based access filters for a teacher
   * @param {Object} teacher - Teacher object with role and other properties
   * @returns {Object} Access filters based on teacher role
   */
  static async getRoleBasedFilters(teacher) {
    if (!teacher) {
      throw new Error('Teacher not authenticated');
    }

    // Default empty filter
    let filters = { status: 'Approved' }; // Base filter for approved events
    
    // Get accessible class IDs based on role
    let accessibleClassIds = [];

    switch (teacher.role) {
      case 'faculty':
        // Faculty can only see reports for classes they teach
        accessibleClassIds = teacher.classes || [];
        break;
        
      case 'advisor':
        // Advisor can see reports for classes they are assigned to
        const advisorClasses = await Class.find({ 
          academicAdvisor: teacher._id 
        }).select('_id');
        
        accessibleClassIds = advisorClasses.map(c => c._id);
        break;
        
      case 'HOD':
        // HOD can see all classes in their department
        const departmentClasses = await Class.find({ 
          department: teacher.department 
        }).select('_id');
        
        accessibleClassIds = departmentClasses.map(c => c._id);
        break;
        
      case 'admin':
        // Admin can see everything
        return filters;
        
      default:
        // No access
        return { _id: "nonexistent" }; 
    }

    // We'll need these class IDs to filter students later
    filters.accessibleClassIds = accessibleClassIds;
    
    return filters;
  }

  /**
   * Apply user-provided filters on top of role-based filters
   * @param {Object} baseFilters - Role-based access filters
   * @param {Object} userFilters - User provided filters like year, class, etc.
   */
  static applyUserFilters(baseFilters, userFilters = {}) {
    const finalFilters = { ...baseFilters };
    
    // Filter by studentYear if provided
    if (userFilters.studentYear) {
      finalFilters.studentYear = userFilters.studentYear;
    }
    
    // Filter by specific class if provided
    if (userFilters.classId) {
      // Make sure the requested class is in the allowed classes
      if (finalFilters.accessibleClassIds && 
          finalFilters.accessibleClassIds.length > 0 && 
          !finalFilters.accessibleClassIds.some(id => 
            id.toString() === userFilters.classId.toString()
          )) {
        throw new Error('You do not have access to this class');
      }
      
      finalFilters.specificClassId = userFilters.classId;
    }
    
    // Filter by category if provided
    if (userFilters.category) {
      finalFilters.category = userFilters.category;
    }
    
    // Filter by date range if provided
    if (userFilters.startDate && userFilters.endDate) {
      finalFilters.dateRange = {
        $gte: new Date(userFilters.startDate),
        $lte: new Date(userFilters.endDate)
      };
    }
    
    return finalFilters;
  }

  /**
   * Helper function to get student class map including access control
   */
  static async getStudentClassMap(filters) {
    try {
      // Get accessible classes based on role
      let classQuery = {};
      
      if (filters.specificClassId) {
        // Looking for a specific class
        classQuery._id = filters.specificClassId;
      } else if (filters.accessibleClassIds && filters.accessibleClassIds.length > 0) {
        // Filter to role-accessible classes
        classQuery._id = { $in: filters.accessibleClassIds };
      }
      
      // Apply department filter if it exists
      if (filters.department) {
        classQuery.department = filters.department;
      }
      
      // Apply year filter if it exists
      if (filters.studentYear) {
        classQuery.year = filters.studentYear;
      }
      
      // Get filtered classes
      const classes = await Class.find(classQuery).lean();
      console.log(`Found ${classes.length} accessible classes`);
      
      // Create a map of class ID to class name
      const classIdToNameMap = new Map(
        classes.map(cls => [cls._id.toString(), cls.className])
      );
      
      // Get students in those classes
      const students = await Student.find({
        'currentClass.ref': { $in: classes.map(c => c._id) }
      }).lean();
      
      // Create a map of student ID to class name and details
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

  /**
   * REPORT: Get total prize money won (with role-based access)
   */
  static async getTotalPrizeMoney(teacher, userFilters = {}) {
    try {
      console.log('Getting total prize money with role-based access');
      
      // Get role-based access filters
      const baseFilters = await this.getRoleBasedFilters(teacher);
      const filters = this.applyUserFilters(baseFilters, userFilters);
      
      // Get student-class map for filtering
      const studentClassMap = await this.getStudentClassMap(filters);
      
      // Get IDs of accessible students
      const accessibleStudentIds = Array.from(studentClassMap.keys()).map(id => 
        mongoose.Types.ObjectId(id)
      );
      
      if (accessibleStudentIds.length === 0) {
        return 0;
      }
      
      // Build the query
      let matchStage = { 
        status: 'Approved',
        submittedBy: { $in: accessibleStudentIds }
      };
      
      // Add date range if specified
      if (filters.dateRange) {
        matchStage.date = filters.dateRange;
      }
      
      // Add category if specified
      if (filters.category) {
        matchStage.category = filters.category;
      }
      
      const result = await Event.aggregate([
        { $match: matchStage },
        { $group: { _id: null, totalPrizeMoney: { $sum: "$priceMoney" } } }
      ]);
      
      console.log('Total prize money result:', result);
      return result.length > 0 ? result[0].totalPrizeMoney : 0;
    } catch (error) {
      console.error('Error getting total prize money:', error);
      return 0;
    }
  }

  /**
   * REPORT: Get total prize money won by class (with role-based access)
   */
  static async getTotalPrizeMoneyByClass(teacher, userFilters = {}) {
    try {
      console.log('Getting prize money by class with role-based access');
      
      // Get role-based access filters
      const baseFilters = await this.getRoleBasedFilters(teacher);
      const filters = this.applyUserFilters(baseFilters, userFilters);
      
      // Get student-class map for filtering
      const studentClassMap = await this.getStudentClassMap(filters);
      
      // Get IDs of accessible students
      const accessibleStudentIds = Array.from(studentClassMap.keys()).map(id => 
        mongoose.Types.ObjectId(id)
      );
      
      if (accessibleStudentIds.length === 0) {
        return [];
      }
      
      // Build the query
      let matchStage = { 
        status: 'Approved',
        submittedBy: { $in: accessibleStudentIds }
      };
      
      // Add date range if specified
      if (filters.dateRange) {
        matchStage.date = filters.dateRange;
      }
      
      // Add category if specified
      if (filters.category) {
        matchStage.category = filters.category;
      }
      
      // Get events submitted by accessible students
      const events = await Event.find(matchStage)
        .populate('submittedBy')
        .lean();
      
      // Group results by class
      const classPrizeMoney = {};
      
      events.forEach(event => {
        if (!event.submittedBy) return;
        
        const studentId = event.submittedBy._id.toString();
        const className = studentClassMap.get(studentId);
        
        if (!className) return;
        
        if (!classPrizeMoney[className]) {
          classPrizeMoney[className] = 0;
        }
        
        classPrizeMoney[className] += (event.priceMoney || 0);
      });
      
      // Format the result
      const result = Object.entries(classPrizeMoney).map(([className, totalPrizeMoney]) => ({
        className,
        totalPrizeMoney
      })).sort((a, b) => b.totalPrizeMoney - a.totalPrizeMoney);
      
      console.log('Class prize money result:', result);
      return result;
    } catch (error) {
      console.error('Error getting class prize money:', error);
      return [];
    }
  }

  /**
   * REPORT: Get top students (with role-based access)
   */
  static async getTopStudents(teacher, userFilters = {}) {
    try {
      const limit = userFilters.limit || 10;
      console.log('Getting top students with role-based access, limit:', limit);
      
      // Get role-based access filters
      const baseFilters = await this.getRoleBasedFilters(teacher);
      const filters = this.applyUserFilters(baseFilters, userFilters);
      
      // Get student-class map for filtering
      const studentClassMap = await this.getStudentClassMap(filters);
      
      // Get IDs of accessible students
      const accessibleStudentIds = Array.from(studentClassMap.keys()).map(id => 
        mongoose.Types.ObjectId(id)
      );
      
      if (accessibleStudentIds.length === 0) {
        return [];
      }
      
      // Build the query
      let matchStage = { 
        status: 'Approved',
        submittedBy: { $in: accessibleStudentIds }
      };
      
      // Add date range if specified
      if (filters.dateRange) {
        matchStage.date = filters.dateRange;
      }
      
      // Add category if specified
      if (filters.category) {
        matchStage.category = filters.category;
      }
      
      // Get student performance data
      const result = await Event.aggregate([
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

  /**
   * REPORT: Get top performers by category (with role-based access)
   */
  static async getTopPerformersByCategory(teacher, userFilters = {}) {
    try {
      const category = userFilters.category;
      const limit = userFilters.limit || 10;
      
      console.log('Getting top performers for category with role-based access:', category);
      
      // Get role-based access filters
      const baseFilters = await this.getRoleBasedFilters(teacher);
      const filters = this.applyUserFilters(baseFilters, userFilters);
      
      // Get student-class map for filtering
      const studentClassMap = await this.getStudentClassMap(filters);
      
      // Get IDs of accessible students
      const accessibleStudentIds = Array.from(studentClassMap.keys()).map(id => 
        mongoose.Types.ObjectId(id)
      );
      
      if (accessibleStudentIds.length === 0) {
        return [];
      }
      
      // Build the query
      let matchStage = { 
        status: 'Approved',
        submittedBy: { $in: accessibleStudentIds }
      };
      
      // Add category filter
      if (category) {
        matchStage.category = category;
      }
      
      // Add date range if specified
      if (filters.dateRange) {
        matchStage.date = filters.dateRange;
      }
      
      const result = await Event.aggregate([
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
          $group: {
            _id: {
              studentId: '$student._id',
              category: '$category'
            },
            name: { $first: '$student.name' },
            totalPoints: { $sum: '$pointsEarned' }
          }
        },
        {
          $group: {
            _id: '$_id.category',
            students: {
              $push: {
                studentId: '$_id.studentId',
                name: '$name',
                points: '$totalPoints'
              }
            }
          }
        },
        {
          $project: {
            category: '$_id',
            students: {
              $slice: [
                {
                  $sortArray: {
                    input: '$students',
                    sortBy: { points: -1 }
                  }
                },
                limit
              ]
            },
            _id: 0
          }
        }
      ]);
      
      // Add class information to each student
      const finalResult = result.map(categoryData => {
        const studentsWithClass = categoryData.students.map(student => ({
          ...student,
          className: studentClassMap.get(student.studentId.toString()) || 'Unknown Class'
        }));
        
        return {
          category: categoryData.category,
          students: studentsWithClass
        };
      });
      
      console.log(`Found top performers for ${result.length} categories`);
      return finalResult;
    } catch (error) {
      console.error('Error getting top performers by category:', error);
      return [];
    }
  }

  /**
   * REPORT: Get popular categories (with role-based access)
   */
  static async getPopularCategories(teacher, userFilters = {}) {
    try {
      const limit = userFilters.limit || 10;
      console.log('Getting popular categories with role-based access');
      
      // Get role-based access filters
      const baseFilters = await this.getRoleBasedFilters(teacher);
      const filters = this.applyUserFilters(baseFilters, userFilters);
      
      // Get student-class map for filtering
      const studentClassMap = await this.getStudentClassMap(filters);
      
      // Get IDs of accessible students
      const accessibleStudentIds = Array.from(studentClassMap.keys()).map(id => 
        mongoose.Types.ObjectId(id)
      );
      
      if (accessibleStudentIds.length === 0) {
        return [{ name: 'No Data', value: 1 }];
      }
      
      // Build the query
      let matchStage = { 
        status: 'Approved',
        submittedBy: { $in: accessibleStudentIds }
      };
      
      // Add date range if specified
      if (filters.dateRange) {
        matchStage.date = filters.dateRange;
      }
      
      const result = await Event.aggregate([
        { $match: matchStage },
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

  /**
   * REPORT: Get class performance (with role-based access)
   */
  static async getClassPerformance(teacher, userFilters = {}) {
    try {
      console.log('Getting class performance with role-based access');
      
      // Get role-based access filters
      const baseFilters = await this.getRoleBasedFilters(teacher);
      const filters = this.applyUserFilters(baseFilters, userFilters);
      
      // Get student-class map for filtering
      const studentClassMap = await this.getStudentClassMap(filters);
      
      // Get IDs of accessible students
      const accessibleStudentIds = Array.from(studentClassMap.keys()).map(id => 
        mongoose.Types.ObjectId(id)
      );
      
      if (accessibleStudentIds.length === 0) {
        return [];
      }
      
      // Build the query
      let matchStage = { 
        status: 'Approved',
        submittedBy: { $in: accessibleStudentIds }
      };
      
      // Add date range if specified
      if (filters.dateRange) {
        matchStage.date = filters.dateRange;
      }
      
      // Add category if specified
      if (filters.category) {
        matchStage.category = filters.category;
      }
      
      // Get events with student data
      const approvedEvents = await Event.find(matchStage)
        .populate('submittedBy', 'name')
        .lean();
      
      console.log(`Found ${approvedEvents.length} approved events`);
      
      // Group events by class
      const classPerformance = new Map();
      
      for (const event of approvedEvents) {
        if (!event.submittedBy) continue;
        
        const studentId = event.submittedBy._id.toString();
        const className = studentClassMap.get(studentId);
        
        if (!className) continue;
        
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

  /**
   * REPORT: Get detailed student performance (with role-based access)
   */
  static async getDetailedStudentPerformance(teacher, userFilters = {}) {
    try {
      const limit = userFilters.limit || 10;
      console.log('Getting detailed student performance with role-based access');
      
      // Get role-based access filters
      const baseFilters = await this.getRoleBasedFilters(teacher);
      const filters = this.applyUserFilters(baseFilters, userFilters);
      
      // Get student-class map for filtering
      const studentClassMap = await this.getStudentClassMap(filters);
      
      // Get IDs of accessible students
      const accessibleStudentIds = Array.from(studentClassMap.keys()).map(id => 
        mongoose.Types.ObjectId(id)
      );
      
      if (accessibleStudentIds.length === 0) {
        return [];
      }
      
      // Build the query
      let matchStage = { 
        status: 'Approved',
        submittedBy: { $in: accessibleStudentIds }
      };
      
      // Add date range if specified
      if (filters.dateRange) {
        matchStage.date = filters.dateRange;
      }
      
      // Add category if specified
      if (filters.category) {
        matchStage.category = filters.category;
      }
      
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
            _id: "$studentInfo._id",
            name: { $first: "$studentInfo.name" },
            registerNo: { $first: "$studentInfo.registerNo" },
            totalPoints: { $sum: "$pointsEarned" },
            eventCount: { $sum: 1 },
            categories: {
              $push: {
                category: "$category",
                points: "$pointsEarned",
                eventTitle: "$title"
              }
            }
          }
        },
        { $sort: { totalPoints: -1 } },
        { $limit: limit }
      ]);
      
      // Add class information
      const studentsWithClass = result.map(student => ({
        ...student,
        className: studentClassMap.get(student._id.toString()) || 'Unknown Class'
      }));
      
      console.log('Detailed student performance result:', studentsWithClass);
      return studentsWithClass;
    } catch (error) {
      console.error('Error getting detailed student performance:', error);
      return [];
    }
  }

  /**
   * REPORT: Get category-wise performance by class (with role-based access)
   */
  static async getCategoryPerformanceByClass(teacher, userFilters = {}) {
    try {
      console.log('Getting category performance by class with role-based access');
      
      // Get role-based access filters
      const baseFilters = await this.getRoleBasedFilters(teacher);
      const filters = this.applyUserFilters(baseFilters, userFilters);
      
      // Get student-class map for filtering
      const studentClassMap = await this.getStudentClassMap(filters);
      
      // Get IDs of accessible students
      const accessibleStudentIds = Array.from(studentClassMap.keys()).map(id => 
        mongoose.Types.ObjectId(id)
      );
      
      if (accessibleStudentIds.length === 0) {
        return [];
      }
      
      // Build the query
      let matchStage = { 
        status: 'Approved',
        submittedBy: { $in: accessibleStudentIds }
      };
      
      // Add date range if specified
      if (filters.dateRange) {
        matchStage.date = filters.dateRange;
      }
      
      // Get events with student data and category
      const approvedEvents = await Event.find(matchStage)
        .populate('submittedBy', 'name')
        .lean();
      
      // Group events by class and category
      const classCategoryPerformance = new Map();
      
      for (const event of approvedEvents) {
        if (!event.submittedBy) continue;
        
        const studentId = event.submittedBy._id.toString();
        const className = studentClassMap.get(studentId);
        
        if (!className) continue;
        
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

  /**
   * REPORT: Get inactive students (with role-based access)
   */
  static async getInactiveStudents(teacher, userFilters = {}) {
    try {
      const inactivePeriodDays = userFilters.days || 30;
      console.log('Getting inactive students with role-based access for', inactivePeriodDays, 'days');
      
      // Get role-based access filters
      const baseFilters = await this.getRoleBasedFilters(teacher);
      const filters = this.applyUserFilters(baseFilters, userFilters);
      
      // Set cutoff date
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - inactivePeriodDays);
      
      // Get student-class map for filtering
      const studentClassMap = await this.getStudentClassMap(filters);
      
      // Get IDs of accessible students
      const accessibleStudentIds = Array.from(studentClassMap.keys()).map(id => 
        mongoose.Types.ObjectId(id)
      );
      
      if (accessibleStudentIds.length === 0) {
        return [];
      }
      
      // Get students from the map
      const students = await Student.find({
        _id: { $in: accessibleStudentIds }
      }).lean();
      
      console.log(`Found ${students.length} accessible students`);
      
      // Get active student IDs (those who submitted events after cutoff)
      const activeStudentIds = await Event.distinct('submittedBy', {
        submittedBy: { $in: accessibleStudentIds },
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
          $match: {
            submittedBy: { $in: inactiveStudents.map(s => s._id) }
          }
        },
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
        registerNo: student.registerNo,
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

  /**
   * REPORT: Get class-wise participation (with role-based access)
   */
  static async getClassParticipation(teacher, userFilters = {}) {
    try {
      console.log('Getting class participation with role-based access');
      
      // Get role-based access filters
      const baseFilters = await this.getRoleBasedFilters(teacher);
      const filters = this.applyUserFilters(baseFilters, userFilters);
      
      // Get student-class map for filtering
      const studentClassMap = await this.getStudentClassMap(filters);
      
      // Get IDs of accessible students
      const accessibleStudentIds = Array.from(studentClassMap.keys()).map(id => 
        mongoose.Types.ObjectId(id)
      );
      
      if (accessibleStudentIds.length === 0) {
        return [];
      }
      
      // Get unique class names
      const uniqueClassNames = [...new Set(Array.from(studentClassMap.values()))];
      
      // For each class, calculate participation stats
      const result = [];
      
      for (const className of uniqueClassNames) {
        // Get students in this class
        const studentsInClass = Array.from(studentClassMap.entries())
          .filter(([_, cls]) => cls === className)
          .map(([id, _]) => mongoose.Types.ObjectId(id));
        
        // Get total students in class
        const totalStudents = studentsInClass.length;
        
        // Get participating students (those who submitted at least one approved event)
        const participatingStudentIds = await Event.distinct('submittedBy', {
          status: 'Approved',
          submittedBy: { $in: studentsInClass }
        });
        
        const participatingStudents = participatingStudentIds.length;
        
        // Get total events for this class
        const eventCount = await Event.countDocuments({
          status: 'Approved',
          submittedBy: { $in: studentsInClass }
        });
        
        // Calculate participation rate
        const participationRate = totalStudents > 0 
          ? (participatingStudents / totalStudents * 100).toFixed(2) 
          : 0;
        
        result.push({
          className,
          totalStudents,
          participatingStudents,
          participationRate,
          eventCount
        });
      }
      
      // Sort by participation rate
      result.sort((a, b) => b.participationRate - a.participationRate);
      
      console.log('Class participation result:', result);
      return result;
    } catch (error) {
      console.error('Error getting class participation:', error);
      return [];
    }
  }

  /**
   * REPORT: Get approval rates (with role-based access)
   */
  static async getApprovalRates(teacher, userFilters = {}) {
    try {
      console.log('Getting approval rates with role-based access');
      
      // Get role-based access filters
      const baseFilters = await this.getRoleBasedFilters(teacher);
      const filters = this.applyUserFilters(baseFilters, userFilters);
      
      // Get student-class map for filtering
      const studentClassMap = await this.getStudentClassMap(filters);
      
      // Get IDs of accessible students
      const accessibleStudentIds = Array.from(studentClassMap.keys()).map(id => 
        mongoose.Types.ObjectId(id)
      );
      
      if (accessibleStudentIds.length === 0) {
        return [{ name: 'No Data', value: 1 }];
      }
      
      // For approval rates, we need ALL events (not just approved ones)
      // and only filter by submitter and date range
      let matchStage = {
        submittedBy: { $in: accessibleStudentIds }
      };
      
      // Add date range if specified
      if (filters.dateRange) {
        matchStage.date = filters.dateRange;
      }
      
      const result = await Event.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            name: '$_id',
            value: '$count',
            _id: 0
          }
        }
      ]);
      
      console.log('Approval rates result:', result);
      return result.length > 0 ? result : [{ name: 'No Data', value: 1 }];
    } catch (error) {
      console.error('Error getting approval rates:', error);
      return [{ name: 'Error', value: 1 }];
    }
  }

  /**
   * REPORT: Get event trends over time (with role-based access)
   */
  static async getTrends(teacher, userFilters = {}) {
    try {
      console.log('Getting event trends with role-based access');
      
      // Get role-based access filters
      const baseFilters = await this.getRoleBasedFilters(teacher);
      const filters = this.applyUserFilters(baseFilters, userFilters);
      
      // Get student-class map for filtering
      const studentClassMap = await this.getStudentClassMap(filters);
      
      // Get IDs of accessible students
      const accessibleStudentIds = Array.from(studentClassMap.keys()).map(id => 
        mongoose.Types.ObjectId(id)
      );
      
      if (accessibleStudentIds.length === 0) {
        return [];
      }
      
      // Build the query
      let matchStage = { 
        status: 'Approved',
        submittedBy: { $in: accessibleStudentIds }
      };
      
      // Add category if specified
      if (filters.category) {
        matchStage.category = filters.category;
      }
      
      const result = await Event.aggregate([
        { $match: matchStage },
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

  /**
   * Get available classes for report filtering (based on teacher role)
   */
  static async getAvailableClasses(teacher) {
    try {
      console.log('Getting available classes for teacher role:', teacher.role);
      
      // Get role-based access filters
      const baseFilters = await this.getRoleBasedFilters(teacher);
      
      // Get classes based on role
      let classQuery = {};
      
      if (baseFilters.accessibleClassIds && baseFilters.accessibleClassIds.length > 0) {
        classQuery._id = { $in: baseFilters.accessibleClassIds };
      }
      
      // Get filtered classes
      const classes = await Class.find(classQuery)
        .select('_id className section year department')
        .sort({ year: -1, className: 1 })
        .lean();
      
      console.log(`Found ${classes.length} accessible classes`);
      return classes;
    } catch (error) {
      console.error('Error getting available classes:', error);
      return [];
    }
  }
}

module.exports = RoleBasedEventReportsService;