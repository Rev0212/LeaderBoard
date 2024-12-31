const express = require('express')
const router = express.Router();
const {body} = require("express-validator")
const adminController = require('../controllers/admin.controller')
const authMiddleware = require('../middlewares/auth.middlewares')

router.post('/register',[
    body('email').isEmail().withMessage('Invalid Email'),
    body('name').isLength({min:3}).withMessage('Name must be atleat 3 char long'),
    body('password').isLength({min:6}).withMessage("Password must be atlaest 6 characters long")
],
 adminController.registeradmin
)


router.post('/login',[
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').isLength({min:6}).withMessage("Password must be atlaest 6 characters long")
],
    adminController.loginadmin
)

router.get('/profile', authMiddleware.authAdmin, adminController.getAdminProfile);


// router.get('/logout', authMiddleware.authadmin, adminController.logoutadmin)

module.exports = router