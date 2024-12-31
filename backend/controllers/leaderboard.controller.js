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
    const skip = (page - 1) * limit;

    // Optional filtering by class
    const filter = {};
    if (req.query.classId) {
      filter.class = req.query.classId;
    }

    // Get total count for pagination
    const totalStudents = await studentModel.countDocuments(filter);

    // Fetch leaderboard
    const leaderboard = await studentModel
      .find(filter)
      .sort({ totalPoints: -1 }) // Sort by totalPoints descending
      .skip(skip)
      .limit(limit)
      .select('name email totalPoints class'); // Include only required fields

    // Add rank to each student
    const leaderboardWithRanks = leaderboard.map((student, index) => ({
      ...student.toObject(),
      rank: skip + index + 1,
    }));

    res.status(200).json({
      success: true,
      data: leaderboardWithRanks,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalStudents / limit),
        totalStudents,
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
