// routes/classRoutes.js
const express = require('express');
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

// Set storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, `teachers-${Date.now()}.csv`);
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

const router = express.Router();

router.post('/create', authMiddleware.authAdmin, classController.createClass);
router.put('/add-students', authMiddleware.authAdmin , classController.addStudentsToClass);
router.put('/change-teacher', authMiddleware.authAdmin , classController.changeClassTeacher);
router.get('/:classId', authMiddleware.authAdmin , classController.getClassDetails);
router.post('/create-in-bulk',(req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        next();
    });
},classController.createClassesInBulk);
router.put('/add-students-in-bulk',(req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        next();
    });
}, classController.addStudentsToClassInBulk);


module.exports = router;
