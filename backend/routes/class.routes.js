// routes/classRoutes.js
const express = require('express');
const classController = require('../controllers/class.controller');
const authMiddleware = require('../middlewares/auth.middlewares')

const router = express.Router();

router.post('/create', authMiddleware.authAdmin ,classController.createClass);
router.put('/add-students', authMiddleware.authAdmin , classController.addStudentsToClass);
router.put('/change-teacher', authMiddleware.authAdmin , classController.changeClassTeacher);
router.get('/:classId', authMiddleware.authAdmin , classController.getClassDetails);
router.post('/bulk-create',authMiddleware.authAdmin,classController.createClassesFromCSV)
module.exports = router;
