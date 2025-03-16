const studentModel = require('../models/student.model');

/**
 * Get leaderboard with filtering and pagination
 */
exports.getLeaderboard = async (filterOptions, paginationOptions) => {
    const { department, course, year, section } = filterOptions;
    const { limit = 10, page = 1, sortBy = 'totalPoints' } = paginationOptions;
    
    const filter = {};
    if (department) filter.department = department;
    if (course) filter.course = course;
    if (year) filter['currentClass.year'] = parseInt(year);
    if (section) filter['currentClass.section'] = section;
    
    // First, get all students with their points for proper ranking calculation
    const allStudents = await studentModel.find(filter)
        .sort({ totalPoints: -1 })
        .select('_id totalPoints')
        .lean();
    
    // Calculate dense ranking - FIXED LOGIC
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
    
    // Get paginated students with full data
    const students = await studentModel.find(filter)
        .sort({ totalPoints: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .select('name registerNo totalPoints');
        
    const total = await studentModel.countDocuments(filter);
    
    // Add rank to each student using the rankMap
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

/**
 * Get student's rank
 */
exports.getStudentRank = async (studentId) => {
  try {
    // Aggregate to calculate student's rank with tied ranks support
    const rankPipeline = [
      {
        $setWindowFields: {
          sortBy: { totalPoints: -1 },
          output: {
            rank: { $denseRank: {} }, // Use denseRank instead of rank
          },
        },
      },
      {
        $match: { _id: studentId },
      },
      {
        $project: {
          _id: 0,
          rank: 1,
          totalPoints: 1, // Include points for debugging
        },
      },
    ];

    const result = await studentModel.aggregate(rankPipeline);
    
    if (!result || result.length === 0) {
      throw new Error('Student not found or has no rank');
    }
    
    return result[0].rank;
  } catch (error) {
    console.error('Error calculating student rank:', error);
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