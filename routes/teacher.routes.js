const express = require('express')
const router = express.Router();
const {body} = require("express-validator")
const teacherController = require('../controllers/teacher.controller')
const authMiddleware = require('../middlewares/auth.middlewares')

router.post('/register',[
    body('email').isEmail().withMessage('Invalid Email'),
    body('name').isLength({min:3}).withMessage('Name must be atleat 3 char long'),
    body('password').isLength({min:6}).withMessage("Password must be atlaest 6 characters long")
],
 teacherController.registerTeacher
)


router.post('/login',[
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').isLength({min:6}).withMessage("Password must be atlaest 6 characters long")
],
    teacherController.loginTeacher
)

router.get('/profile',authMiddleware.authTeacher,teacherController.getProfile)

//router.get('/logout', authMiddleware.authTeacher, userController.)

module.exports = router