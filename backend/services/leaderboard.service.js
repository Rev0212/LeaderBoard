const studentModel = require('../models/student.model');

/**
 * Get leaderboard with filtering and pagination
 */
exports.getLeaderboard = async (filterOptions, paginationOptions) => {
    const { department, course, year, section } = filterOptions;
    const { limit = 10, page = 1, sortBy = 'points' } = paginationOptions;
    
    const filter = {};
    if (department) filter.department = department;
    if (course) filter.course = course;
    if (year) filter['currentClass.year'] = parseInt(year);
    if (section) filter['currentClass.section'] = section;
    
    const sortOrder = sortBy === 'points' ? -1 : 1; // Descending for points
    const skip = (page - 1) * limit;
    
    const students = await studentModel.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit))
        .select('name registerNo currentClass points department course')
        .populate({
            path: 'currentClass.ref',
            select: 'year section academicYear'
        });
        
    const total = await studentModel.countDocuments(filter);
    
    return {
        students,
        pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
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