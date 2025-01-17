const Event = require('../models/event.model');
const studentModel = require('../models/student.model');


const createEvent = async (eventData) => {
    try {
        // Validate required fields based on category
        if (['Hackathon', 'Ideathon', 'Coding', 'Workshop', 'Conference'].includes(eventData.category)) {
            if (!eventData.eventLocation) {
                throw new Error('Event location is required for this category');
            }
            if (!eventData.eventScope) {
                throw new Error('Event scope is required for this category');
            }
            if (!eventData.eventOrganizer) {
                throw new Error('Event organizer is required for this category');
            }
            if (!eventData.participationType) {
                throw new Error('Participation type is required for this category');
            }
            if (eventData.eventLocation === 'Outside College' && !eventData.otherCollegeName) {
                throw new Error('College name is required for outside college events');
            }
        }

        // Validate prize money for winning positions
        if (['First', 'Second', 'Third'].includes(eventData.positionSecured) && !eventData.priceMoney) {
            throw new Error('Prize money is required for winning positions');
        }

        const newEvent = new Event(eventData);
        const savedEvent = await newEvent.save();
        return savedEvent;
    } catch (error) {
        throw new Error(`Failed to create event: ${error.message}`);
    }
};

const reviewEvent = async (eventId, status, teacherId) => {
    console.log('Inside reviewEvent service');
    console.log(eventId, status, teacherId);
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
            console.log(`${event.pointsEarned} --- check444`);
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

const editEventStatus = async (eventId, newStatus, teacherId) => {
    console.log('Inside editEventStatus service');
    try {
        const event = await Event.findById(eventId);

        // Check if event exists
        if (!event) {
            console.error(`Event not found for ID: ${eventId}`);
            return { success: false, error: 'Event not found' };
        }

        if (event.status === newStatus) {
            console.log(`Event status is already ${newStatus}`);
            return { success: false, error: `Event status is already ${newStatus}` };
        }

        // Update event status and points
        event.status = newStatus;
        event.approvedBy = teacherId;

        if (newStatus === 'Approved') {
            const pointsMap = {
                First: 100,
                Second: 75,
                Third: 50,
                Participated: 25,
            };
            event.pointsEarned = pointsMap[event.positionSecured] || 0;
        } else if (newStatus === 'Rejected') {
            event.pointsEarned = 0;
        }

        // Save updated event
        const updatedEvent = await event.save();
        return { success: true, data: updatedEvent };
    } catch (error) {
        console.error(`Failed to edit event status: ${error.message}`);
        return { success: false, error: error.message };
    }
};



const getEventById = async (eventId) => {
    try {
        const event = await Event.findById(eventId);
        if (!event) {
            throw new Error('Event not found');
        }
        return event;
    } catch (error) {
        throw new Error(`Failed to get event by ID: ${error.message}`);
    }
};

module.exports = { createEvent,reviewEvent,editEventStatus ,getEventById };
