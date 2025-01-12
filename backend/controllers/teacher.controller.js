const fs = require('fs');
const path = require('path');
const multer = require('multer');
const teacherModel = require('../models/teacher.model');
const teacherService = require('../services/teacher.service');
const TeacherBulkService = require('../services/teacherBulk.services') 
const BlacklistToken = require('../models/blacklistToken.model');
const { validationResult } = require('express-validator');

// Ensure uploads directory exists
const uploadPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath);
}


module.exports.registerTeacher = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, registerNo, password } = req.body;

        const isUserAlready = await teacherModel.findOne({ email });

        if (isUserAlready) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await teacherModel.hashedPassword(password);

        const teacher = await teacherService.createTeacher({
            name,
            registerNo,
            email,
            password: hashedPassword
        });

        const token = teacher.generateAuthToken();
        res.cookie('token', token);

        res.status(201).json({ token, teacher });
    } catch (error) {
        next(error);
    }
};

module.exports.registerTeachersBulk = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a CSV file check2' });
        }
        const teacherBulkService = new TeacherBulkService();
        const results = await teacherBulkService.processCSV(req.file.path);
        console.log(results)

        // Clean up the uploaded file
        fs.unlinkSync(req.file.path);

        res.status(200).json({
            message: 'Bulk registration completed',
            successful: results.successful.length,
            failed: results.failed.length,
            failedEntries: results.failed,
            teachers: results.successful 
        });
    } catch (error) {
        next(error);
    }
};

module.exports.loginTeacher = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        const teacher = await teacherModel.findOne({ email }).select('+password');

        if (!teacher) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await teacher.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const token = teacher.generateAuthToken();
        res.cookie('token', token);

        res.status(200).json({ token, teacher });
    } catch (error) {
        next(error);
    }
};

module.exports.getProfile = async (req, res, next) => {
    try {
        if (!req.teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

       
        const populatedTeacher = await teacherModel.findById(req.teacher._id)
            .populate('classes')
            

        if (!populatedTeacher) {
            return res.status(404).json({ message: 'Teacher data not found' });
        }

        res.status(200).json(populatedTeacher);
    } catch (error) {
        next(error); // Pass the error to the error handling middleware
    }
};


module.exports.addProfileImg = async (req, res, next) => { 
    try {
        const { registerNo, profileImg } = req.body;
        console.log(registerNo,profileImg)
        const teacher = await teacherService.addProfileImg(registerNo, profileImg);

        res.status(200).json(teacher);
    } catch (error) {
        next(error);
    }
}


module.exports.changePassword = async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const teacher = await teacherService.changePassword(req.teacher._id, oldPassword, newPassword);

        res.status(200).json(teacher);
    } catch (error) {
        next(error);
    }
}

module.exports.logoutTeacher = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization.split(' ')[1];

        await BlacklistToken.create({ token });

        res.clearCookie('token');

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
};
