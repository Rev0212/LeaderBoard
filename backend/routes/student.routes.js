const express = require('express')
const router = express.Router();
const {body} = require("express-validator")
const studentController = require('../controllers/student.controller')
const authMiddleware = require('../middlewares/auth.middlewares')
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



// router.post('/register',[
//     body('email').isEmail().withMessage('Invalid Email'),
//     body('name').isLength({min:3}).withMessage('Name must be atleat 3 char long'),
//     body('password').isLength({min:6}).withMessage("Password must be atlaest 6 characters long")
// ],
//  studentController.registerStudent
// )


router.post('/login',[
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').isLength({min:6}).withMessage("Password must be atlaest 6 characters long")
],
    studentController.loginStudent
)

router.get('/profile', authMiddleware.authStudent, studentController.getStudentProfile);

router.post('/bulk-register', 
    (req, res, next) => {
        upload.single('file')(req, res, (err) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }
            next();
        });
    },
    studentController.registerStudentsBulk
);

router.put('/add-profile-img', studentController.updateStudentProfile);

router.put('/change-password',authMiddleware.authStudent, studentController.changePassword);

router.get('/logout', authMiddleware.authStudent, studentController.logoutStudent);
module.exports = router

router.get('/events/:id',studentController.getstudentEventDetails);

router.get('/events-history', authMiddleware.authStudent, studentController.getAllStudentEvents);
