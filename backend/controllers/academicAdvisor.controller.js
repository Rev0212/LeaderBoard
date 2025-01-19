const AcademicAdvisor = require('../models/academicAdvisor.model');
const Class = require('../models/class.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const blackListModel = require('../models/blacklistToken.model');
const EventReportsService = require('../services/eventReports.service');
const { convertToCSV } = require('../utils/csvConverter');

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

// New report functions
const getAdvisorReports = async (req, res) => {
  try {
    const { filterType = 'monthly' } = req.query;
    const advisorId = req.advisor._id;

    // Get advisor's assigned classes
    const advisor = await AcademicAdvisor.findById(advisorId).populate('assignedClasses');
    const classIds = advisor.assignedClasses.map(c => c._id);

    // Get various reports
    const [
      classPerformance,
      topStudents,
      categoryPerformance,
      popularCategories,
      approvalRates,
      inactiveStudents,
      classParticipation
    ] = await Promise.all([
      EventReportsService.getClassPerformance(filterType),
      EventReportsService.getTopStudents(10, filterType),
      EventReportsService.getCategoryPerformanceByClass(filterType),
      EventReportsService.getPopularCategories(10, filterType),
      EventReportsService.getApprovalRates(filterType),
      EventReportsService.getInactiveStudents(30), // Default 30 days
      EventReportsService.getClassParticipation(filterType)
    ]);

    // Filter data based on advisor's assigned classes if not HOD
    if (advisor.role !== 'hod') {
      const filterByAssignedClasses = (data) => {
        return data.filter(item => 
          advisor.assignedClasses.some(c => 
            c.className === item.className || c.name === item.className
          )
        );
      };

      res.status(200).json({
        classPerformance: filterByAssignedClasses(classPerformance),
        topStudents: topStudents.filter(student => 
          advisor.assignedClasses.some(c => student.className === c.className)
        ),
        categoryPerformance: filterByAssignedClasses(categoryPerformance),
        popularCategories,
        approvalRates,
        inactiveStudents: filterByAssignedClasses(inactiveStudents),
        classParticipation: filterByAssignedClasses(classParticipation)
      });
    } else {
      // HOD gets all data
      res.status(200).json({
        classPerformance,
        topStudents,
        categoryPerformance,
        popularCategories,
        approvalRates,
        inactiveStudents,
        classParticipation
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const downloadAdvisorReport = async (req, res) => {
  try {
    const { reportType } = req.params;
    const { filterType = 'monthly' } = req.query;
    const advisorId = req.advisor._id;

    // Get advisor's assigned classes
    const advisor = await AcademicAdvisor.findById(advisorId).populate('assignedClasses');

    let data;
    switch (reportType) {
      case 'class-performance':
        data = await EventReportsService.getClassPerformance(filterType);
        break;
      case 'top-students':
        data = await EventReportsService.getTopStudents(50, filterType);
        break;
      case 'category-performance':
        data = await EventReportsService.getCategoryPerformanceByClass(filterType);
        break;
      case 'inactive-students':
        data = await EventReportsService.getInactiveStudents(30);
        break;
      default:
        throw new Error('Invalid report type');
    }

    // Filter data if not HOD
    if (advisor.role !== 'hod') {
      data = data.filter(item => 
        advisor.assignedClasses.some(c => 
          c.className === item.className || c.name === item.className
        )
      );
    }

    // Convert to CSV
    const csv = await convertToCSV(data);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${reportType}-report.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  login,
  getReports,
  logoutAdvisor,
  getAdvisorReports,
  downloadAdvisorReport
}; 