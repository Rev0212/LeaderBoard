const express = require('express');
const EventReportsController = require('../controllers/eventReports.controller');

const router = express.Router();

router.get('/total-prize-money', EventReportsController.getTotalPrizeMoney);
router.get('/total-prize-money/class/:className',  EventReportsController.getTotalPrizeMoneyByClass);
router.get('/top-students',  EventReportsController.getTopStudents);
router.get('/top-performers/:category',  EventReportsController.getTopPerformersByCategory);
router.get('/popular-categories',  EventReportsController.getPopularCategories);
router.get('/approval-rates',  EventReportsController.getApprovalRates);
router.get('/trends/:filterType',  EventReportsController.getTrends);
router.get('/class-wise-participation/:className',  EventReportsController.getClassWiseParticipation);

module.exports = router;
