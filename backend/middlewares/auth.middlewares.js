const studentModel = require('../models/student.model');
const jwt = require('jsonwebtoken');
const blackListTokenModel = require('../models/blacklistToken.model');
const teacherModel = require('../models/teacher.model');
const adminModel = require('../models/admin.model')



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
    try {
        console.log("Auth headers:", req.headers.authorization); // Debug log
        
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        
        if (!token) {
            console.log("No token provided in request"); // Debug log
            return res.status(401).json({ message: 'Unauthorized: Token missing' });
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
    } catch (error) {
        console.error("Auth middleware error:", error); // Debug log
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
} 

module.exports.authAdmin = async (req, res, next) => {
    const token = req.cookies['admin-token'] || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: Admin token missing' });
    }

    const isBlacklisted = await blackListTokenModel.findOne({ token: token });

    if (isBlacklisted) {
        return res.status(401).json({ message: 'Unauthorized: Token revoked' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await adminModel.findById(decoded._id);

        if (!admin) {
            return res.status(401).json({ message: 'Unauthorized: Admin not found' });
        }

        req.admin = admin;
        return next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};

module.exports.authHOD = async (req, res, next) => {
    try {
        await module.exports.authTeacher(req, res, () => {
            if (req.teacher && req.teacher.role === 'HOD') {
                next();
            } else {
                return res.status(403).json({ message: 'Access denied. HOD role required.' });
            }
        });
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

module.exports.authAcademicAdvisor = async (req, res, next) => {
    try {
        await module.exports.authTeacher(req, res, () => {
            if (req.teacher && (req.teacher.role === 'Academic Advisor' || req.teacher.role === 'HOD')) {
                next();
            } else {
                return res.status(403).json({ message: 'Access denied. Academic Advisor role required.' });
            }
        });
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};