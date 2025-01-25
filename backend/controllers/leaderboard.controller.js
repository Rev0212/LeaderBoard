const { validationResult } = require('express-validator');
const studentModel = require('../models/student.model');

// Get leaderboard with pagination and optional filtering
exports.getLeaderboard = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchQuery = req.query.search || '';
    const skip = (page - 1) * limit;

    // First, get ALL students (regardless of search) for global ranking
    const allStudents = await studentModel
      .find({}) // No filter here to get everyone
      .sort({ totalPoints: -1 })
      .select('_id totalPoints')
      .lean();

    // Calculate global ranks
    let currentRank = 1;
    let currentPoints = null;
    const globalRankMap = new Map();
    
    allStudents.forEach((student) => {
      if (student.totalPoints !== currentPoints) {
        currentPoints = student.totalPoints;
        globalRankMap.set(student._id.toString(), currentRank++);
      } else {
        globalRankMap.set(student._id.toString(), currentRank - 1);
      }
    });

    // Now apply search/class filters for pagination
    const filter = {};
    if (req.query.classId) {
      filter.class = req.query.classId;
    }
    if (searchQuery) {
      filter.name = { $regex: searchQuery, $options: 'i' };
    }

    // Get total count of filtered results for pagination
    const totalFilteredStudents = await studentModel.countDocuments(filter);

    // Get paginated results with filters
    const leaderboard = await studentModel
      .find(filter)
      .sort({ totalPoints: -1 })
      .skip(skip)
      .limit(limit)
      .select('name email registerNo totalPoints class')
      .lean();

    // Add global ranks to the filtered results
    const leaderboardWithRanks = leaderboard.map(student => ({
      ...student,
      rank: globalRankMap.get(student._id.toString())
    }));

    res.status(200).json({
      success: true,
      data: leaderboardWithRanks,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalFilteredStudents / limit),
        totalStudents: totalFilteredStudents,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving leaderboard',
      error: error.message,
    });
  }
};

// Get student's rank
exports.getStudentRank = async (req, res) => {
  try {
    const studentId = req.student._id; // Extract student ID from middleware

    // Aggregate to calculate student's rank
    const rankPipeline = [
      {
        $setWindowFields: {
          sortBy: { totalPoints: -1 },
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
      return res.status(404).json({ success: false, message: 'Rank not found for student' });
    }

    res.status(200).json({
      success: true,
      rank: rankResult.rank,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving student rank',
      error: error.message,
    });
  }
};
