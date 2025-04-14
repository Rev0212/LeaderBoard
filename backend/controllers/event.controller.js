const eventService = require('../services/event.services');
const studentModel = require('../models/student.model');
const teacherModel = require('../models/teacher.model');
const eventModel = require('../models/event.model');
const PointsCalculationService = require('../services/pointsCalculation.service');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FormFieldConfig = require('../models/formFieldConfig.model');
const { title } = require('process');

// Configure multer storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadDir;
    if (file.fieldname === 'certificateImages') {
      uploadDir = path.join(__dirname, '../uploads/certificates');
    } else {
      uploadDir = path.join(__dirname, '../uploads/documents');
    }
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = file.fieldname + '-' + uniqueSuffix + ext;
    
    // Only store the relative path in the database
    if (file.fieldname === 'pdfDocument') {
      req.pdfPath = '/uploads/documents/' + filename;
    } else if (file.fieldname === 'certificateImages') {
      if (!req.certificatePaths) req.certificatePaths = [];
      req.certificatePaths.push('/uploads/certificates/' + filename);
    }
    
    cb(null, filename);
  }
});

// Configure file filter to validate file types
const fileFilter = function(req, file, cb) {
  if (file.fieldname === 'certificateImages') {
    // Accept only image files
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed for certificates!'), false);
    }
  } else if (file.fieldname === 'pdfDocument') {
    // Accept only PDF files
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed for proof documents!'), false);
    }
  }
  cb(null, true);
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB max file size
  }
});

// Middleware for file upload
const uploadMiddleware = upload.fields([
  { name: 'certificateImages', maxCount: 10 },
  { name: 'pdfDocument', maxCount: 1 }
]);

// Student submits a new event
const submitEvent = async (req, res) => {
    try {
        const certificateImages = req.files?.['certificateImages'] || [];
        console.log(req.body)
        const pdfDocument = req.files?.['pdfDocument']?.[0];
        console.log(req.body.category)
        // Get form configuration for validation
        const formConfig = await FormFieldConfig.findOne({ category: req.body.category });
        console.log('Form configuration:', formConfig);
        if (!formConfig) {
            return res.status(400).json({
                success: false,
                message: 'No form configuration found for this category'
            });
        }

        // Create event data object
        const eventData = {
            eventName: req.body.eventName, // Changed from req.body.title
            description: req.body.description,
            date: req.body.date,
            category: req.body.category,
            proofUrl: req.certificatePaths || [],
            pdfDocument: req.pdfPath || null,
            submittedBy: req.student._id,
            customAnswers: new Map()
        };

        // Add all other fields from the body
        // This will include positionSecured, eventScope, etc.
        Object.keys(req.body).forEach(key => {
            if (!['eventName', 'description', 'date', 'category'].includes(key)) {
                eventData[key] = req.body[key];
            }
        });

        // Process custom answers
        if (formConfig.customQuestions) {
            formConfig.customQuestions.forEach(question => {
                const answerId = `customAnswer_${question.id}`;
                if (req.body[answerId]) {
                    eventData.customAnswers.set(question.id, req.body[answerId]);
                }
            });
        }

        console.log('Event data before saving:', eventData);

        const newEvent = await eventService.createEvent(eventData);

        res.status(201).json({
            success: true,
            message: 'Event submitted successfully',
            event: newEvent
        });
    } catch (error) {
        console.error('Error submitting event:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit event',
            error: error.message
        });
    }
};

// Teacher approves or rejects an event
const reviewEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const event = await eventModel.findById(id);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }
        
        event.status = status;
        event.approvedBy = req.teacher._id;
        
        if (status === 'Approved') {
            // Use new points calculation service
            event.pointsEarned = await PointsCalculationService.calculatePoints(event);
            
            // Update student total points
            await studentModel.findByIdAndUpdate(
                event.submittedBy,
                { $inc: { totalPoints: event.pointsEarned } }
            );
        } else {
            // If event was previously approved, subtract points
            if (event.status === 'Approved' && event.pointsEarned > 0) {
                await studentModel.findByIdAndUpdate(
                    event.submittedBy,
                    { $inc: { totalPoints: -event.pointsEarned } }
                );
            }
            event.pointsEarned = 0;
        }
        
        await event.save();
        
        res.status(200).json({
            success: true,
            data: event,
            message: `Event ${status.toLowerCase()} successfully`
        });
    } catch (error) {
        console.error('Error reviewing event:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Replace the existing getEvents function
const getEvents = async (req, res) => {
    if (!req.teacher) {
        return res.status(403).json({ message: 'Unauthorized access' });
    }

    try {
        const teacher = req.teacher;
        console.log("Fetching events for teacher:", teacher._id);
        console.log("Teacher classes:", teacher.classes);
        
        // Check if teacher has classes
        if (!teacher.classes || teacher.classes.length === 0) {
            console.log("Teacher has no classes assigned");
            return res.status(200).json([]);
        }

        // Get student IDs from teacher's classes - FIX THIS QUERY
        const studentsInClasses = await studentModel.find({ 
            // The problem is here - student schema uses 'currentClass.ref', not 'class'
            'currentClass.ref': { $in: teacher.classes }
            // You could also try just 'class' if that's what's being used
            // 'class': { $in: teacher.classes }
        }).select('_id');
        
        console.log(`Found ${studentsInClasses.length} students in teacher's classes`);
        
        if (studentsInClasses.length === 0) {
            console.log("No students found in teacher's classes");
            return res.status(200).json([]);
        }

        // Get events from these students
        const events = await eventModel.find({
            submittedBy: { $in: studentsInClasses.map(s => s._id) },
            status: "Pending"
        })
        .populate('submittedBy')
        .populate('approvedBy');
        
        console.log(`Found ${events.length} pending events`);
        
        res.status(200).json(events);
    } catch (error) {
        console.error("Error in getEvents:", error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const editEvent = async (req, res) => {
    console.log('Inside editEvent controller');
    try {
        const { id } = req.params;
        const { newStatus } = req.body;

        if (!newStatus) {
            return res.status(400).json({ error: 'New status is required' });
        }

        if (!req.teacher || !req.teacher._id) {
            return res.status(401).json({ error: 'Unauthorized: Teacher ID is missing' });
        }

        const teacherId = req.teacher._id;

        // Call service to update event status
        const result = await eventService.editEventStatus(id, newStatus, teacherId);

        if (!result.success) {
            const statusCode = result.error === 'Event not found' ? 404 : 400;
            return res.status(statusCode).json({ error: result.error });
        }

        const updatedEvent = result.data;

        // Update student points based on the new status
        const student = await studentModel.findById(updatedEvent.submittedBy);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        if (newStatus === 'Approved') {
            student.totalPoints += updatedEvent.pointsEarned;
        } else if (newStatus === 'Rejected') {
            student.totalPoints -= updatedEvent.pointsEarned;
        }

        await student.save();

        res.status(200).json({
            message: 'Event status updated successfully',
            event: updatedEvent,
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'Failed to update event status',
            details: error.message,
        });
    }
};

const getAllStudentEvents = async (req, res) => {
    if (!req.teacher) {
        return res.status(403).json({ message: 'Unauthorized access' });
    }

    try {
        const { studentId } = req.params;

        // Find all events for the specific student
        const events = await eventModel.find({
            submittedBy: studentId
        })
        .populate('submittedBy', 'name class')  // Only populate necessary student fields
        .populate('approvedBy', 'name')  // Only populate teacher name
        .sort({ date: -1 });  // Sort by date, newest first

        res.status(200).json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const verifyAndCalculatePoints = async (req, res) => {
  try {
    const { eventId, approved } = req.body;
    
    if (!approved) {
      return res.status(200).json({
        success: true,
        message: 'Event rejected, no points assigned'
      });
    }
    
    // Get the event details
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Calculate points based on event details
    const points = await PointsCalculationService.calculatePoints(event);
    
    // Update the event with calculated points
    event.pointsEarned = points;
    event.status = 'Approved';
    event.approvedBy = req.teacher._id;
    await event.save();
    
    // Update the student's total points
    const student = await Student.findById(event.submittedBy);
    if (student) {
      student.totalPoints += points;
      await student.save();
    }
    
    return res.status(200).json({
      success: true,
      message: 'Event verified and points calculated',
      data: { points }
    });
  } catch (error) {
    console.error('Error verifying and calculating points:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify and calculate points'
    });
  }
};

const getScoringRules = async (req, res) => {
  try {
    const categoryRules = {
      'Hackathon': {
        'Level': {
          'Intra-College': 10,
          'Inter-College': 20,
          'National': 30,
          'International': 50
        },
        'Organizer': {
          'Industry': 15,
          'Academic Institution': 5
        },
        'Mode': {
          'Solo Participation': 15,
          'Team Participation': 0
        },
        'Outcome': {
          'First': 40,
          'Second': 30,
          'Third': 20,
          'Finalist': 10,
          'Participant': 5
        },
        'Bonus': {
          'Solo wins over team competition': 10
        }
      },
      'Coding': {
        'Platform': {
          'Top-tier (Codeforces, AtCoder)': 20,
          'Mid-tier (LeetCode, GFG, etc.)': 10,
          'Unknown': 5
        },
        'Type': {
          'Timed contest (e.g., ICPC, Turing Cup)': 10
        },
        'Result Percentile': {
          'Top 1%': 40,
          'Top 5%': 30,
          'Top 10%': 20,
          'Participant': 5
        },
        'Region': {
          'International': 10,
          'National': 5
        }
      },
      'Open Source': {
        'Repo Forks': {
          '>1000 forks': 30,
          '500-1000 forks': 15
        },
        'PR Status': {
          'Merged': 10,
          'Still Open': 5
        },
        'Type of Work': {
          'Feature': 15,
          'Bug Fix': 10,
          'Documentation': 5
        },
        'Lines of Code': {
          '>500 lines': 10
        },
        'No. of PRs': {
          'Every 5 PRs': 5
        },
        'Contributor Badge': {
          'Hacktoberfest finisher': 20,
          'GSoC Contributor': 40
        }
      },
      'Research': {
        'Publisher': {
          'IEEE/Springer/Elsevier': 40,
          'UGC Listed': 25,
          'Others': 10
        },
        'Authorship': {
          '1st Author': 20,
          'Co-author': 10
        },
        'Paper Type': {
          'Research': 20,
          'Review/Survey': 10
        },
        'Event Type': {
          'Conference Presentation': 15,
          'Poster Presentation': 10
        },
        'Level': {
          'International': 20,
          'National': 10
        }
      },
      'Certifications': {
        'Provider': {
          'Stanford/MIT/AWS/Google/Top 500 company': 20,
          'NPTEL': 10,
          'Coursera/Udemy': 2
        },
        'Duration': {
          '<4 weeks': 5,
          '4-8 weeks': 10,
          '>8 weeks': 20
        },
        'Final Project Required': {
          'Yes': 10
        },
        'Certification Level': {
          'Beginner': 5,
          'Intermediate': 10,
          'Advanced': 15
        }
      },
      'NCC-NSS': {
        'Camps Attended': {
          'RDC/TSC': 30,
          'NIC': 20,
          'CATC, ATC': 10
        },
        'Rank': {
          'SUO': 25,
          'JUO': 20
        },
        'Award': {
          'Best Cadet / Parade': 30
        },
        'Volunteer Hours': {
          '50+': 10,
          '100+': 20,
          '200+': 30
        }
      },
      'Sports': {
        'Level': {
          'College': 10,
          'Inter-College': 20,
          'State': 30,
          'National/International': 50
        },
        'Position': {
          'Winner': 30,
          'Runner-Up': 20,
          'Participant': 10
        },
        'Type': {
          'Individual Sport': 10,
          'Team Sport': 5
        }
      },
      'Workshop': {
        'Attendee Duration': {
          '<1 day': 5,
          '1 full day': 10,
          '2+ days': 20
        },
        'Organizer': {
          'Industry (Google, Microsoft)': 10
        },
        'Role': {
          'Conducted Workshop': 25
        }
      },
      'Leadership': {
        'Role': {
          'Club President': 30,
          'Secretary / Event Lead': 20,
          'Member / Core Team': 10
        },
        'Events Managed': {
          '<50 participants': 10,
          '50-100 participants': 15,
          '100+ participants': 20
        },
        'Organized Series': {
          'Per Event (Webinars, Tech Talks, etc.)': 10
        }
      },
      'Social Work': {
        'Type of Activity': {
          'Plantation / Cleanup Drive': 10,
          'Education / NGO Teaching': 15,
          'Health / Disaster Relief': 20
        },
        'Hours Invested': {
          '20-50 hrs': 10,
          '50-100 hrs': 20,
          '100+ hrs': 30
        }
      }
    };

    return res.status(200).json({
      success: true,
      data: categoryRules
    });
  } catch (error) {
    console.error('Error fetching scoring rules:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch scoring rules'
    });
  }
};

// Export the middleware for use in routes
module.exports.uploadEventFiles = uploadMiddleware;

module.exports = { 
    submitEvent,
    uploadEventFiles: uploadMiddleware,
    reviewEvent, 
    getEvents, 
    editEvent, 
    getAllStudentEvents,
    verifyAndCalculatePoints,
    getScoringRules
};
