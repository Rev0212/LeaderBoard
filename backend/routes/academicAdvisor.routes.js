const express = require('express');
const router = express.Router();
const advisorController = require('../controllers/academicAdvisor.controller');
const { authAcademicAdvisor } = require('../middlewares/auth.middlewares');

router.post('/login', advisorController.login);
router.get('/reports', authAcademicAdvisor, advisorController.getReports);
router.post('/logout', authAcademicAdvisor, advisorController.logoutAdvisor);

module.exports = router; 