const eventService = require('../services/event.services');
const studentModel = require('../models/student.model')

// Student submits a new event
const submitEvent = async (req, res) => {
    try {
        const { eventName, description, date, proofUrl, category, positionSecured } = req.body;
        const studentId = req.student._id;

        const newEvent = await eventService.createEvent({
            eventName,
            description,
            date,
            proofUrl,
            category,
            positionSecured
        }, studentId);

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
        
        // Ensure teacherId exists and is valid
        if (!req.teacher || !req.teacher._id) {
            throw new Error("Teacher ID is missing or invalid.");
        }

        const teacherId = req.teacher._id;
        const updatedEvent = await eventService.reviewEvent(id, status, teacherId);

        console.log("Updated Event:", updatedEvent);

        // Add event ID to student model
        const studentId = updatedEvent.submittedBy._id;

        console.log("Student ID:", studentId);

        const eventId = updatedEvent._id;

        const student = await studentModel.findById(studentId);

        if (!student) {
            throw new Error("Student not found.");
        }

        console.log("Student Data:", student);

        // Ensure eventsParticipated is an array before pushing
        if (!student.eventsParticipated) {
            student.eventsParticipated = [];
        }

        student.eventsParticipated.push(eventId);
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




module.exports = { submitEvent, reviewEvent };