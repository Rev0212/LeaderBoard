const express = require('express');
const router = express.Router();
const enumConfigController = require('../controllers/enumConfig.controller');
// Fix the import path to use the correct middleware file
const { authAdmin, requireSuperAdmin } = require('../middlewares/auth.middlewares');

// Apply authentication middleware to all routes
router.use(authAdmin);

// Enum configuration routes
router.get('/', enumConfigController.getAllEnums);
router.get('/type/:type', enumConfigController.getEnumByType);
router.put('/type/:type', requireSuperAdmin, enumConfigController.updateEnum);

// Points configuration routes
router.get('/points', enumConfigController.getPointsConfig);
router.put('/points', requireSuperAdmin, enumConfigController.updatePointsConfig);

// If you have the impact analysis controller, uncomment and add the import
const impactAnalysisController = require('../controllers/impactAnalysis.controller');
router.post('/points/impact-analysis', requireSuperAdmin, impactAnalysisController.analyzePointsChange);

module.exports = router;