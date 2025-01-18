const studentModel = require('../models/student.model');
const studentService = require('../services/student.service');
const blackListModel = require('../models/blacklistToken.model');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const StudentBulkService = require('../services/studentsBulk.services');
const eventModel = require('../models/event.model');


const uploadPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath);
}


module.exports.registerStudentsBulk = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a CSV file' });
        }

        const studentBulkService = new StudentBulkService();
        const results = await studentBulkService.processCSV(req.file.path);

        // Clean up the uploaded file
        fs.unlinkSync(req.file.path);

        res.status(200).json({
            message: 'Bulk registration completed',
            successful: results.successful,
            failed: results.failed.length,
            failedEntries: results.failed,
            students: results.successful // Includes raw passwords
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

    const { name, email, password, registerNo } = req.body;

    const isUserAlready = await studentModel.findOne({ email });
    if (isUserAlready) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await studentModel.hashedPassword(password);

    const student = await studentService.createStudent({
        name,
        email,
        password: hashedPassword,
        rawPassword: password, // Save the raw password
        registerNo
    });

    const token = student.generateAuthToken();
    res.cookie('token', token);

    res.status(201).json({ token, student });
};

// module.exports.registerStudent = async (req, res, next) => {

//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//     }

//     const { name, email, password,registerNo } = req.body;

//     const isUserAlready = await studentModel.findOne({ email });

//     if (isUserAlready) {
//         return res.status(400).json({ message: 'User already exists' });
//     }

//     const hashedPassword = await studentModel.hashPassword(password);
    

//     const student = await studentService.createStudent({
//         name,
//         email,
//         password: hashedPassword,
//         registerNo
//     });

//     const token = student.generateAuthToken();
    
//     res.cookie('token', token);

//     res.status(201).json({ token, student});
// }

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

        // Get student with populated events and class
        const populatedStudent = await studentModel.findById(req.student._id)
            .populate({
                path: 'eventsParticipated',
                match: { status: 'Approved' },
                options: { sort: { date: -1 } }
            })
            .populate('class', 'className');

        if (!populatedStudent) {
            return res.status(404).json({ message: 'Student data not found' });
        }

        // Fetch all events (including pending) for this student
        const allEvents = await eventModel.find({
            submittedBy: req.student._id,
            status: 'Approved'
        }).sort({ date: -1 });

        // Create response object with approved events
        const responseData = {
            ...populatedStudent.toObject(),
            eventsParticipated: allEvents
        };

        res.status(200).json(responseData);
    } catch (error) {
        next(error);
    }
};

module.exports.updateStudentProfile = async (req, res, next) => { 
    try {
        const { registerNo, profileImg } = req.body;
        console.log(registerNo, profileImg);
        const student = await studentService.addProfileImg(registerNo, profileImg);

        res.status(200).json(student);
    } catch (error) {
        next(error);
    }
}


module.exports.changePassword = async (req, res, next) => {
    try {
        if (!req.student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        const { oldPassword, newPassword } = req.body;

        const student = await studentService.changePassword(
            req.student._id,
            oldPassword,
            newPassword
        );

        res.status(200).json(student);
    } catch (error) {
        next(error);
    }
};

module.exports.logoutStudent = async (req, res, next) => {
    try {
        res.clearCookie('token');
        const token = req.cookies.token || req.headers.authorization.split(' ')[1];
        await blackListModel.create({ token });
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
}


module.exports.getstudentEventDetails = async (req, res, next) => {
    try {
        const studentId = req.params.id;
        console.log(studentId);
        
        const student = await studentModel.findById(studentId)
            .populate({
                path: 'eventsParticipated',
                match: { status: { $ne: 'Pending' } },
                options: { sort: { date: -1 } }
            });

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.status(200).json(student.eventsParticipated);
    } catch (error) {
        next(error);
    }
};

module.exports.getAllStudentEvents = async (req, res, next) => {
    try {
        if (!req.student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Fetch all events for this student (including all statuses)
        const allEvents = await eventModel.find({
            submittedBy: req.student._id
        }).sort({ date: -1 }); // Sort by date, newest first

        if (!allEvents) {
            return res.status(404).json({ message: 'No events found' });
        }

        res.status(200).json(allEvents);
    } catch (error) {
        next(error);
    }
};
