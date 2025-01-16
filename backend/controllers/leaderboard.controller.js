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

    // Build filter object
    const filter = {};
    if (req.query.classId) {
      filter.class = req.query.classId;
    }
    if (searchQuery) {
      filter.name = { $regex: searchQuery, $options: 'i' }; // Case-insensitive search
    }

    // First, get all students sorted by points
    const allStudents = await studentModel
      .find(filter)
      .sort({ totalPoints: -1 })
      .select('_id totalPoints')
      .lean();

    // Create a map of points to rank using dense ranking
    let currentRank = 1;
    let currentPoints = null;
    const rankMap = new Map();
    
    allStudents.forEach((student) => {
      if (student.totalPoints !== currentPoints) {
        // Only increment rank when points change
        currentPoints = student.totalPoints;
        rankMap.set(student._id.toString(), currentRank++);
      } else {
        // Same points get same rank
        rankMap.set(student._id.toString(), currentRank - 1);
      }
    });

    // Get paginated results
    const leaderboard = await studentModel
      .find(filter)
      .sort({ totalPoints: -1 })
      .skip(skip)
      .limit(limit)
      .select('name email totalPoints class')
      .lean();

    // Add actual ranks to the paginated results
    const leaderboardWithRanks = leaderboard.map(student => ({
      ...student,
      rank: rankMap.get(student._id.toString())
    }));

    res.status(200).json({
      success: true,
      data: leaderboardWithRanks,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(allStudents.length / limit),
        totalStudents: allStudents.length,
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
