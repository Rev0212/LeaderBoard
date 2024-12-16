const express = require('express')
const router = express.Router();
const {body} = require("express-validator")
const studentController = require('../controllers/student.controller')
const authMiddleware = require('../middlewares/auth.middlewares')

router.post('/register',[
    body('email').isEmail().withMessage('Invalid Email'),
    body('name').isLength({min:3}).withMessage('Name must be atleat 3 char long'),
    body('password').isLength({min:6}).withMessage("Password must be atlaest 6 characters long")
],
 studentController.registerStudent
)


router.post('/login',[
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').isLength({min:6}).withMessage("Password must be atlaest 6 characters long")
],
    studentController.loginStudent
)

router.get('/profile', authMiddleware.authStudent, studentController.getStudentProfile);


// router.get('/logout', authMiddleware.authStudent, StudentController.logoutStudent)

module.exports = router