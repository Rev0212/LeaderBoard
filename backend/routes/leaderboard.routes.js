const express = require('express');
const leaderboardController = require('../controllers/leaderboard.controller');
const authMiddleware = require('../middlewares/auth.middlewares');

const router = express.Router();

// Get leaderboard (can be accessed by all authenticated users)
router.get('/',leaderboardController.getLeaderboard);

router.get('/my-rank',leaderboardController.getStudentRank);

module.exports = router;