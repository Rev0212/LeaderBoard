const studentModel = require('../models/student.model');

/**
 * Get leaderboard with filtering and pagination
 */
exports.getLeaderboard = async (filterOptions, paginationOptions) => {
    const { department, course, year, section } = filterOptions;
    const { limit = 10, page = 1, sortBy = 'totalPoints' } = paginationOptions; // Changed points to totalPoints
    
    const filter = {};
    if (department) filter.department = department;
    if (course) filter.course = course;
    if (year) filter['currentClass.year'] = parseInt(year);
    if (section) filter['currentClass.section'] = section;
    
    // Get all students sorted by points for ranking
    const allStudents = await studentModel.find(filter)
        .sort({ totalPoints: -1 })
        .select('_id');
    
    // Create a map of id to rank
    const rankMap = new Map();
    let currentRank = 1;
    let previousPoints = null;
    
    // Get paginated students with full data
    const students = await studentModel.find(filter)
        .sort({ totalPoints: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .select('name registerNo totalPoints');
        
    const total = await studentModel.countDocuments(filter);
    
    // Add rank to each student
    const studentsWithRank = students.map(student => ({
        _id: student._id,
        name: student.name,
        registerNo: student.registerNo,
        totalPoints: student.totalPoints || 0,
        rank: currentRank++
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
    // Aggregate to calculate student's rank
    const rankPipeline = [
        {
            $setWindowFields: {
                sortBy: { points: -1 },
                output: {
                    rank: { $rank: {} }, // Assign rank based on sorted points
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
            },
        },
    ];

    const [rankResult] = await studentModel.aggregate(rankPipeline);
    
    if (!rankResult) {
        throw new Error('Rank not found for student');
    }
    
    return rankResult.rank;
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