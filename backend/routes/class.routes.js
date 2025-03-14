// routes/classRoutes.js
const express = require('express');
const router = express.Router();
const classController = require('../controllers/class.controller');
const authMiddleware = require('../middlewares/auth.middlewares');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath);
}

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, `class-${Date.now()}.csv`);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (path.extname(file.originalname) !== '.csv') {
            return cb(new Error('Only .csv files are allowed'));
        }
        cb(null, true);
    }
});

// Public routes (no auth required)
router.post('/bulk-create', upload.single('file'), classController.createClassesBulk);

// Protected routes (require auth)
router.post('/create', authMiddleware.authTeacher, classController.createClass);
router.get('/details/:classId', authMiddleware.authTeacher, classController.getClassDetails);
router.put('/change-teacher', authMiddleware.authTeacher, classController.changeClassTeacher);
router.post('/add-students', authMiddleware.authTeacher, classController.addStudentsToClass);
router.get('/:classId/students', authMiddleware.authTeacher, classController.getStudentsByClass);
router.post('/assign-advisor', authMiddleware.authAdmin, classController.assignAcademicAdvisor);
router.get('/department/:departmentId', authMiddleware.authTeacher, classController.getClassesByDepartment);
router.post('/bulk-add-students', upload.single('file'), authMiddleware.authTeacher, classController.addStudentsToClassInBulk);

module.exports = router;
