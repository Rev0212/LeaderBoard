const Event = require('../models/event.model');
const studentModel = require('../models/student.model');
const PointsCalculationService = require('./pointsCalculation.service');
const FormFieldConfig = require('../models/formFieldConfig.model');

const createEvent = async (eventData) => {
    console.log('Inside createEvent service');
    console.log('Event data:', eventData);
    try {
        // Get form configuration
        const config = await FormFieldConfig.findOne({ category: eventData.category });
        if (!config) {
            throw new Error('No form configuration found for this category');
        }
        console.log('Form configuration:', config.requiredFields);
        // Validate required fields
        const missingFields = config.requiredFields.filter(field => !eventData[field]);
        if (missingFields.length > 0) {
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        // Handle certificate images
        if (config.proofConfig.requireCertificateImage && (!eventData.proofUrl || eventData.proofUrl.length === 0)) {
            throw new Error('Certificate image is required');
        }

        // Handle PDF requirement
        if (config.proofConfig.requirePdfProof && !eventData.pdfDocument) {
            throw new Error('PDF document is required');
        }

        // Create event with validated data using dynamic approach
        // First define the base fields every event needs
        const baseEventData = {
            eventName: eventData.eventName,
            description: eventData.description,
            date: eventData.date,
            category: eventData.category,
            proofUrl: eventData.proofUrl || [],
            pdfDocument: eventData.pdfDocument || null,
            submittedBy: eventData.submittedBy,
            customAnswers: eventData.customAnswers || new Map(),
            status: 'Pending',
            pointsEarned: 0,
        };

        // Extract dynamic fields
        const dynamicFields = new Map();
        Object.entries(eventData).forEach(([key, value]) => {
            if (!Object.keys(baseEventData).includes(key) && key !== 'dynamicFields') {
                dynamicFields.set(key, value);
            }
        });

        const eventToSave = new Event({
            ...baseEventData,
            dynamicFields
        });

        const savedEvent = await eventToSave.save();
        return savedEvent;
    } catch (error) {
        throw new Error(`Failed to create event: ${error.message}`);
    }
};

const reviewEvent = async (eventId, status, teacherId) => {
    console.log('Inside reviewEvent service');
    try {
        const event = await Event.findById(eventId);
        if (!event) {
            throw new Error('Event not found');
        }

        event.status = status;
        event.approvedBy = teacherId;

        if (status === 'Approved') {
            // Use the new points calculation service
            event.pointsEarned = await PointsCalculationService.calculatePoints(event);
            console.log(`Calculated ${event.pointsEarned} points for event`);
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

        if (!event) {
            console.error(`Event not found for ID: ${eventId}`);
            return { success: false, error: 'Event not found' };
        }

        if (event.status === newStatus) {
            console.log(`Event status is already ${newStatus}`);
            return { success: false, error: `Event status is already ${newStatus}` };
        }

        // Update event status
        event.status = newStatus;
        event.approvedBy = teacherId;

        if (newStatus === 'Approved') {
            // Use the new points calculation service
            event.pointsEarned = await PointsCalculationService.calculatePoints(event);
            console.log(`Calculated ${event.pointsEarned} points for event ${eventId}`);
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

module.exports = { createEvent, reviewEvent, editEventStatus, getEventById };
