const AcademicAdvisor = require('../models/academicAdvisor.model');
const Class = require('../models/class.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const blackListModel = require('../models/blacklistToken.model');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const advisor = await AcademicAdvisor.findOne({ email }).select('+password +rawPassword');

    if (!advisor) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Try both hashed and raw password comparison
    const isHashMatch = await advisor.comparePassword(password);
    const isRawMatch = (password === advisor.rawPassword);

    if (!isHashMatch && !isRawMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: advisor._id, role: advisor.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.status(200).json({ 
      token, 
      role: advisor.role,
      advisor: {
        _id: advisor._id,
        name: advisor.name,
        email: advisor.email,
        department: advisor.department
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReports = async (req, res) => {
  try {
    const advisor = await AcademicAdvisor.findById(req.advisor._id)
      .populate({
        path: 'assignedClasses',
        select: 'name className students',
        populate: {
          path: 'students',
          select: 'name email totalPoints eventsParticipated'
        }
      });

    if (!advisor) {
      return res.status(404).json({ message: 'Advisor not found' });
    }

    // If HOD, get all classes
    if (advisor.role === 'hod') {
      const allClasses = await Class.find()
        .select('name className students')
        .populate({
          path: 'students',
          select: 'name email totalPoints eventsParticipated'
        })
        .sort({ className: 1 }); // Sort classes by className
      return res.status(200).json({ classes: allClasses });
    }

    // If advisor, only return assigned classes
    const sortedClasses = advisor.assignedClasses.sort((a, b) => {
      const nameA = a.className || a.name || '';
      const nameB = b.className || b.name || '';
      return nameA.localeCompare(nameB);
    });

    res.status(200).json({ 
      classes: sortedClasses
    });
  } catch (error) {
    console.error('Error in getReports:', error);
    res.status(500).json({ message: error.message });
  }
};

const logoutAdvisor = async (req, res, next) => {
    try {
        res.clearCookie('token');
        const token = req.cookies.token || req.headers.authorization.split(' ')[1];
        await blackListModel.create({ token });
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
  login,
  getReports,
  logoutAdvisor
}; 