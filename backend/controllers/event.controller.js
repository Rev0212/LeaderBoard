const eventService = require('../services/event.services');
const studentModel = require('../models/student.model')
const teacherModel = require('../models/teacher.model')
const eventModel = require('../models/event.model')

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

        console.log(id);
        console.log(status);

        // Ensure teacherId exists and is valid
        if (!req.teacher || !req.teacher._id) {
            throw new Error("Teacher ID is missing.");
        }

        const teacherId = req.teacher._id;

        // Retrieve the teacher and their classes
        const teacher = await teacherModel.findById(teacherId);
        if (!teacher || !teacher.classes || teacher.classes.length === 0) {
            throw new Error("Teacher or teacher's classes not found.");
        }

        const teacherClassIds = teacher.classes; 

        // Fetch the event details to get the student ID
        const event = await eventModel.findById(id).populate('submittedBy');
        if (!event) {
            throw new Error("Event not found.");
        }

        const studentId = event.submittedBy._id;
        // Don't populate class since we're using currentClass
        const student = await studentModel.findById(studentId);

        if (!student) {
            throw new Error("Student not found.");
        }

        // Check if student has currentClass assigned
        if (!student.currentClass || !student.currentClass.ref) {
            throw new Error("Student's class information is missing.");
        }

        // Convert both IDs to strings for comparison
        const studentClassId = student.currentClass.ref.toString();
        if (!teacherClassIds.some(classId => classId.toString() === studentClassId)) {
            throw new Error("Teacher and student are not in the same class.");
        }

        // Update the event after confirming the class match
        const updatedEvent = await eventService.reviewEvent(id, status, teacherId);

        // Update the student's eventsParticipated and totalPoints
        if (!student.eventsParticipated) {
            student.eventsParticipated = [];
        }

        student.eventsParticipated.push(updatedEvent._id);
        const oldPoints = student.totalPoints;
        console.log(oldPoints);
        student.totalPoints = oldPoints + updatedEvent.pointsEarned;
        console.log(student.totalPoints);
        await student.save();

        res.status(200).json({ 
            message: 'Event reviewed successfully', 
            event: updatedEvent 
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ 
            error: 'Failed to review event', 
            details: error.message 
        });
    }
};

const getEvents = async (req, res) => {
    if (!req.teacher) {
        return res.status(403).json({ message: 'Unauthorized access' });
    }

    try {
        const teacher = req.teacher;

        // Find events for students in the teacher's classes
        const events = await eventModel.find({
            // Populate the submittedBy field to access student's class
            submittedBy: { 
                $in: await studentModel.find({ 
                    class: { $in: teacher.classes } 
                }).select('_id') 
            },
            status:"Pending"
        }).populate('submittedBy').populate('approvedBy');
        const pendingEvents = events.status 
        res.status(200).json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
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
