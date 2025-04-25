const express = require('express');
const router = express.Router();
const enumConfigController = require('../controllers/enumConfig.controller');
const { authAdmin, requireSuperAdmin, oka } = require('../middlewares/auth.middlewares');
const impactAnalysisController = require('../controllers/impactAnalysis.controller');
const categoryPointsConfigController = require('../controllers/categoryPointsConfig.controller');

// Apply authentication middleware to all routes
router.use(authAdmin);

// Debug log (optional)
const enumController = require("../controllers/enumConfig.controller");
console.log("enumController", enumController);

// Enum configuration routes
router.get('/', enumConfigController.getAllEnums);
router.get('/type/:type', enumConfigController.getEnumByType);
router.put('/type/:type', requireSuperAdmin, enumConfigController.updateEnum);

// Points configuration routes
router.get('/points', enumConfigController.getPointsConfig);
router.put('/points', requireSuperAdmin, enumConfigController.updatePointsConfig);

// Get and update category-based rules
router.get('/category-rules', requireSuperAdmin, enumConfigController.getCategoryRules);
router.post('/category-rules', requireSuperAdmin, enumConfigController.updateCategoryRules);

// Get and update form field configuration by category
router.get('/form-fields/:category', enumConfigController.getFormFieldConfig);
router.put('/form-fields/:category', requireSuperAdmin, enumConfigController.updateFormFieldConfig);

// Points impact analysis
router.post('/points/impact-analysis', requireSuperAdmin, impactAnalysisController.analyzePointsChange);

// Then your routes can use the controller
router.get('/points/category/:categoryName', authAdmin, categoryPointsConfigController.getCategoryPointsConfig);
router.put('/points/category/:categoryName', requireSuperAdmin, categoryPointsConfigController.updateCategoryPointsConfig);
router.post('/points/impact-analysis', requireSuperAdmin, categoryPointsConfigController.analyzeImpact);

module.exports = router;
