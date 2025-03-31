const studentModel = require('../models/student.model');

/**
 * Get leaderboard with filtering and pagination
 */
exports.getLeaderboard = async (filterOptions, paginationOptions) => {
    const { department, course, year, section, search } = filterOptions;
    const { limit = 10, page = 1, sortBy = 'totalPoints' } = paginationOptions;
    
    // Create base filter without search for calculating ranks
    const baseFilter = {};
    if (department) baseFilter.department = department;
    if (course) baseFilter.course = course;
    if (year) baseFilter['currentClass.year'] = parseInt(year);
    if (section) baseFilter['currentClass.section'] = section;
    
    // First, get all students with their points for proper ranking calculation (without search filter)
    const allStudents = await studentModel.find(baseFilter)
        .sort({ totalPoints: -1 })
        .select('_id totalPoints')
        .lean();
    
    // Calculate dense ranking
    let currentRank = 0;
    let previousPoints = null;
    const rankMap = new Map();
    
    for (const student of allStudents) {
        // If points are different from previous student, increment rank
        if (student.totalPoints !== previousPoints) {
            currentRank++;
            previousPoints = student.totalPoints;
        }
        
        rankMap.set(student._id.toString(), currentRank);
    }
    
    // Now create search filter for pagination
    const searchFilter = {...baseFilter};
    if (search) {
        searchFilter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { registerNo: { $regex: search, $options: 'i' } }
        ];
    }
    
    // Get paginated students with search filter
    const students = await studentModel.find(searchFilter)
        .sort({ totalPoints: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .select('name registerNo totalPoints department currentClass');
        
    const total = await studentModel.countDocuments(searchFilter);
    
    // Add rank to each student using the original rank map
    const studentsWithRank = students.map(student => ({
        _id: student._id,
        name: student.name,
        registerNo: student.registerNo,
        totalPoints: student.totalPoints || 0,
        department: student.department,
        year: student.currentClass?.year,
        rank: rankMap.get(student._id.toString())
    }));

    return {
        data: studentsWithRank,
        pagination: {
            total,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit)
        }
    };
};

/**
 * Get student's rank
 */
exports.getStudentRank = async (studentId) => {
  try {
    // Get the student to determine their context
    const student = await studentModel.findById(studentId);
    if (!student) {
      throw new Error('Student not found');
    }
    
    if (student.totalPoints === undefined || student.totalPoints === null) {
      return { 
        overallRank: null, 
        contextRank: null,
        totalPoints: 0 
      };
    }
    
    // For overall rank - get all students and their points
    const allStudents = await studentModel.find()
      .sort({ totalPoints: -1 })
      .select('_id totalPoints')
      .lean();
    
    // Calculate dense ranking for overall rank
    let currentRank = 0;
    let previousPoints = null;
    let overallRank = null;
    
    for (const s of allStudents) {
      // If points are different from previous student, increment rank
      if (s.totalPoints !== previousPoints) {
        currentRank++;
        previousPoints = s.totalPoints;
      }
      
      // If this is our target student, store their rank
      if (s._id.toString() === studentId.toString()) {
        overallRank = currentRank;
      }
    }
    
    // For context rank - get students in same year and department
    const contextStudents = await studentModel.find({
      'currentClass.year': student.currentClass?.year,
      'department': student.department
    })
      .sort({ totalPoints: -1 })
      .select('_id totalPoints')
      .lean();
    
    // Calculate dense ranking for context rank
    currentRank = 0;
    previousPoints = null;
    let contextRank = null;
    
    for (const s of contextStudents) {
      // If points are different from previous student, increment rank
      if (s.totalPoints !== previousPoints) {
        currentRank++;
        previousPoints = s.totalPoints;
      }
      
      // If this is our target student, store their rank
      if (s._id.toString() === studentId.toString()) {
        contextRank = currentRank;
      }
    }
    
    return {
      overallRank,
      contextRank,
      totalPoints: student.totalPoints,
      totalStudents: allStudents.length,
      contextTotalStudents: contextStudents.length
    };
  } catch (error) {
    console.error('Error in getStudentRank service:', error);
    throw error;
  }
};

/**
 * Get department leaderboard
 */
exports.getDepartmentLeaderboard = async (department, paginationOptions) => {
    return await this.getLeaderboard({ department }, paginationOptions);
};

/**
 * Get class leaderboard
 */
exports.getClassLeaderboard = async (year, section, department, paginationOptions) => {
    return await this.getLeaderboard({ 
        year, 
        section,
        department
    }, paginationOptions);
};

/**
 * Get student context leaderboard
 */
exports.getStudentContextLeaderboard = async (student, paginationOptions) => {
    const { limit = 10, page = 1, search } = paginationOptions;
    
    // Create base filter for students in the same context (year and department)
    const contextFilter = {
        'currentClass.year': student.currentClass?.year,
        'department': student.department
    };
    
    // First calculate ranks using ALL students in the context (without search filter)
    const allContextStudents = await studentModel.find(contextFilter)
        .sort({ totalPoints: -1 })
        .select('_id totalPoints')
        .lean();
    
    // Calculate dense ranking for all students in the context
    let currentRank = 0;
    let previousPoints = null;
    const rankMap = new Map();
    
    for (const student of allContextStudents) {
        // If points are different from previous student, increment rank
        if (student.totalPoints !== previousPoints) {
            currentRank++;
            previousPoints = student.totalPoints;
        }
        
        rankMap.set(student._id.toString(), currentRank);
    }
    
    // Now apply search filter for pagination only
    const searchFilter = {...contextFilter};
    if (search) {
        searchFilter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { registerNo: { $regex: search, $options: 'i' } }
        ];
    }
    
    // Get paginated students with the search filter
    const students = await studentModel.find(searchFilter)
        .sort({ totalPoints: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .select('name registerNo totalPoints');
        
    const total = await studentModel.countDocuments(searchFilter);
    
    // Add rank to each student using the original rank map
    const studentsWithRank = students.map(student => ({
        _id: student._id,
        name: student.name,
        registerNo: student.registerNo,
        totalPoints: student.totalPoints || 0,
        rank: rankMap.get(student._id.toString())
    }));

    return {
        data: studentsWithRank,
        pagination: {
            total,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit)
        }
    };
};