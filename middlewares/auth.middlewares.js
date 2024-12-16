const studentModel = require('../models/student.model');
const jwt = require('jsonwebtoken');
const blackListTokenModel = require('../models/blacklistToken.model');
const teacherModel = require('../models/teacher.model');

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
        console.log(decoded)
        const teacher = await teacherModel.findById(decoded._id)
         console.log(teacher)
        req.teacher = teacher;

        return next();

    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
} 