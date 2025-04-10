const eventService = require('../services/event.services');
const studentModel = require('../models/student.model');
const teacherModel = require('../models/teacher.model');
const eventModel = require('../models/event.model');
const PointsCalculationService = require('../services/pointsCalculation.service');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
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
        // Extract the files from the request
        const certificateImages = req.files?.['certificateImages'] || [];
        const pdfDocument = req.files?.['pdfDocument']?.[0];
        
        const {
            eventName,
            description,
            date,
            category,
            eventLocation,
            otherCollegeName,
            eventScope,
            eventOrganizer,
            participationType,
            positionSecured,
            priceMoney
        } = req.body;
        
        const studentId = req.student._id;

        // Create event data object with conditional fields
        const eventData = {
            eventName,
            description,
            date,
            category,
            positionSecured,
            // Use file paths from uploaded files
            proofUrl: certificateImages.map(file => file.path),
            pdfDocument: pdfDocument ? pdfDocument.path : null,
            submittedBy: studentId,
            // Initialize custom answers object
            customAnswers: {}
        };

        // Process custom question answers
        Object.keys(req.body).forEach(key => {
            if (key.startsWith('customAnswer_')) {
                const questionId = key.replace('customAnswer_', '');
                if (key.endsWith('[]')) {
                    // This is an array for multiple choice questions
                    eventData.customAnswers[questionId] = Array.isArray(req.body[key]) ? 
                        req.body[key] : [req.body[key]];
                } else {
                    eventData.customAnswers[questionId] = req.body[key];
                }
            }
        });

        // Add conditional fields based on category
        if (['Hackathon', 'Ideathon', 'Coding', 'Workshop', 'Conference'].includes(category)) {
            eventData.eventLocation = eventLocation;
            eventData.eventScope = eventScope;
            eventData.eventOrganizer = eventOrganizer;
            eventData.participationType = participationType;

            if (eventLocation === 'Outside College') {
                eventData.otherCollegeName = otherCollegeName;
            }
        }

        // Add prize money if position is top 3
        if (['First', 'Second', 'Third'].includes(positionSecured)) {
            eventData.priceMoney = priceMoney;
        }

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

// Export the middleware for use in routes
module.exports.uploadEventFiles = uploadMiddleware;

module.exports = { 
    submitEvent,
    uploadEventFiles: uploadMiddleware, // Use uploadMiddleware directly
    reviewEvent, 
    getEvents, 
    editEvent, 
    getAllStudentEvents 
};
