const eventService = require('../services/event.services');
const studentModel = require('../models/student.model')
const teacherModel = require('../models/teacher.model')
const eventModel = require('../models/event.model')

// Student submits a new event
const submitEvent = async (req, res) => {
    try {
        const { eventName, description, date, proofUrl, category, positionSecured,priceMoney, pdfDocument } = req.body;
        const studentId = req.student._id;

        const newEvent = await eventService.createEvent({
            eventName,
            description,
            date,
            proofUrl,
            category,
            positionSecured,
            priceMoney,
            pdfDocument,
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
            throw new Error("Teacher ID is missing .");
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
        const student = await studentModel.findById(studentId);
        

        if (!student) {
            throw new Error("Student not found.");
        }

        const studentClassId = student.class; // Assuming `classId` exists in the student model

        // Check if the teacher's class IDs include the student's class ID
        if (!teacherClassIds.includes(studentClassId.toString())) {
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


module.exports = { submitEvent, reviewEvent, getEvents };