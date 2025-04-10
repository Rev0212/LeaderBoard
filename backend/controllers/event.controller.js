const eventService = require('../services/event.services');
const studentModel = require('../models/student.model');
const teacherModel = require('../models/teacher.model');
const eventModel = require('../models/event.model');
const PointsCalculationService = require('../services/pointsCalculation.service');

// Student submits a new event
const submitEvent = async (req, res) => {
    try {
        const {
            eventName,
            description,
            date,
            proofUrl,
            category,
            eventLocation,
            otherCollegeName,
            eventScope,
            eventOrganizer,
            participationType,
            positionSecured,
            priceMoney,
            pdfDocument
        } = req.body;
        
        const studentId = req.student._id;

        // Create event data object with conditional fields
        const eventData = {
            eventName,
            description,
            date,
            proofUrl,
            category,
            positionSecured,
            pdfDocument,
            submittedBy: studentId
        };

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
            message: 'Event submitted successfully', 
            event: newEvent 
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to submit event', 
            details: error.message 
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

module.exports = { submitEvent, reviewEvent, getEvents, editEvent, getAllStudentEvents };
