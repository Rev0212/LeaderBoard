const express = require('express');
const leaderboardController = require('../controllers/leaderboard.controller');
const authMiddleware = require('../middlewares/auth.middlewares');

const router = express.Router();

// Get general leaderboard (with optional filters)
router.get('/', leaderboardController.getLeaderboard);

// Get student's own rank
router.get('/my-rank', authMiddleware.authStudent, leaderboardController.getStudentRank);

// Get leaderboard specific to student's year and department
router.get('/my-context', authMiddleware.authStudent, leaderboardController.getMyContextLeaderboard);

module.exports = router;