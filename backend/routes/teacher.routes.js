const express = require('express');
const router = express.Router();
const { body } = require("express-validator");
const teacherController = require('../controllers/teacher.controller');
const authMiddleware = require('../middlewares/auth.middlewares');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath);
}

// Multer configuration with file type validation
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

// Routes
router.post('/register', [
    body('email').isEmail().withMessage('Invalid Email'),
    body('name').isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
    body('password').isLength({ min: 6 }).withMessage("Password must be at least 6 characters long")
], teacherController.registerTeacher);

router.post('/login', [
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').isLength({ min: 6 }).withMessage("Password must be at least 6 characters long")
], teacherController.loginTeacher);

router.get('/profile', authMiddleware.authTeacher, teacherController.getProfile);

router.post('/bulk-register', 
    (req, res, next) => {
        upload.single('file')(req, res, (err) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }
            next();
        });
    },
    teacherController.registerTeachersBulk
);

router.put('/add',teacherController.addProfileImg);

router.post('/change-password', authMiddleware.authTeacher, teacherController.changePassword);


// Uncomment or implement the logout route
// router.get('/logout', authMiddleware.authTeacher, teacherController.logout);

module.exports = router;
