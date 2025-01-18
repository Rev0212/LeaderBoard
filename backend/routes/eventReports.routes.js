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
router.get('/class-performance', EventReportsController.getClassPerformance);
router.get('/detailed-student-performance', EventReportsController.getDetailedStudentPerformance);
router.get('/category-performance-by-class', EventReportsController.getCategoryPerformanceByClass);
router.get('/download/:reportType', EventReportsController.downloadReport);

module.exports = router;