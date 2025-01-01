const studentModel = require('../models/student.model');
const studentService = require('../services/student.service');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const StudentBulkService = require('../services/studentsBulk.services');


const uploadPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath);
}


module.exports.registerStudentsBulk = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a CSV file check2' });
        }

        const studentBulkService = new StudentBulkService();
        const results = await studentBulkService.processCSV(req.file.path);

        // Clean up the uploaded file
        fs.unlinkSync(req.file.path);

        res.status(200).json({
            message: 'Bulk registration completed',
            successful: results.successful.length,
            failed: results.failed.length,
            failedEntries: results.failed,
            students: results.successful 
        });
    } catch (error) {
        next(error);
    }
};

module.exports.registerStudent = async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password,registerNo } = req.body;

    const isUserAlready = await studentModel.findOne({ email });

    if (isUserAlready) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await studentModel.hashPassword(password);
    

    const student = await studentService.createStudent({
        name,
        email,
        password: hashedPassword,
        registerNo
    });

    const token = student.generateAuthToken();
    
    res.cookie('token', token);

    res.status(201).json({ token, student});
}

module.exports.loginStudent = async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    

    const student = await studentModel.findOne({ email }).select('+password');


    if (!student) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await student.comparePassword(password);


    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid password' });
    }

    const token = student.generateAuthToken();

    res.cookie('token', token);

    res.status(200).json({ token, student });
}

module.exports.getStudentProfile = async (req, res, next) => {
    try {
        if (!req.student) {
            return res.status(404).json({ message: 'Student not found' });
        }

       
        const populatedStudent = await studentModel.findById(req.student._id)
            .populate('eventsParticipated')
            

        if (!populatedStudent) {
            return res.status(404).json({ message: 'Student data not found' });
        }

        res.status(200).json(populatedStudent);
    } catch (error) {
        next(error); // Pass the error to the error handling middleware
    }
};
