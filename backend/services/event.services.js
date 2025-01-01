const Event = require('../models/event.model');
const studentModel = require('../models/student.model');


const createEvent = async (eventData, studentId) => {
    try {
        const newEvent = new Event({
            ...eventData,
            submittedBy: studentId,
            status: 'Pending' // Set default status
        });

        // Save the event in the service layer
        const savedEvent = await newEvent.save();
        return savedEvent;
    } catch (error) {
        // Handle specific errors
        throw new Error(`Failed to create event: ${error.message}`);
    }
};

const reviewEvent = async (eventId, status, teacherId) => {
    try {
        const event = await Event.findById(eventId);
        if (!event) {
            throw new Error('Event not found');
        }


        event.status = status;
 
        event.approvedBy = teacherId;

        if (status === 'Approved') {
            const pointsMap = {
                First: 100,
                Second: 75,
                Third: 50,
                Participated: 25
            };
            event.pointsEarned = pointsMap[event.positionSecured] || 0;
            console.log(`${event.pointsEarned} --- check1`);
        } else {
            event.pointsEarned = 0;
        }
        

        // Save the updated event
        const updatedEvent = await event.save();
    
        return updatedEvent;
    } catch (error) {
        throw new Error(`Failed to review event: ${error.message}`);
    }
};


module.exports = { createEvent, reviewEvent };