const studentModel = require('../models/student.model');
const jwt = require('jsonwebtoken');
const blackListTokenModel = require('../models/blacklistToken.model');
const teacherModel = require('../models/teacher.model');
const adminModel = require('../models/admin.model')
const academicAdvisorModel = require('../models/academicAdvisor.model');

module.exports.authStudent = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[ 1 ];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized Token missing' });
    }


    const isBlacklisted = await blackListTokenModel.findOne({ token: token });

    if (isBlacklisted) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const student = await studentModel.findById(decoded._id)

        req.student = student;

        return next();

    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
}

module.exports.authTeacher = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[ 1 ];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized Token missing' });
    }


    const isBlacklisted = await blackListTokenModel.findOne({ token: token });

    if (isBlacklisted) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
       
        const teacher = await teacherModel.findById(decoded._id)
        
        req.teacher = teacher;

        return next();

    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
} 

module.exports.authAdmin = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[ 1 ];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized Token missing' });
    }


    const isBlacklisted = await blackListTokenModel.findOne({ token: token });

    if (isBlacklisted) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await adminModel.findById(decoded._id)

        req.admin = admin;

        return next();

    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized Error' });
    }
}

module.exports.authAcademicAdvisor = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized Token missing' });
    }

    const isBlacklisted = await blackListTokenModel.findOne({ token: token });

    if (isBlacklisted) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const advisor = await academicAdvisorModel.findById(decoded.id);

        if (!advisor) {
            return res.status(401).json({ message: 'Unauthorized - Invalid advisor' });
        }

        if (decoded.role !== 'advisor' && decoded.role !== 'hod') {
            return res.status(403).json({ message: 'Forbidden - Invalid role' });
        }

        req.advisor = advisor;
        req.isHOD = decoded.role === 'hod';

        return next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};