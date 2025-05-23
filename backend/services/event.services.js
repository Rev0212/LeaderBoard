const Event = require('../models/event.model');
const studentModel = require('../models/student.model');
const PointsCalculationService = require('./pointsCalculation.service');
const FormFieldConfig = require('../models/formFieldConfig.model');

// Add this date validation helper function
const validateEventDate = (dateString) => {
  const eventDate = new Date(dateString);
  const currentDate = new Date();
  const minDate = new Date('2010-01-01');
  
  // Check if this is a valid date
  if (isNaN(eventDate.getTime())) {
    throw new Error('Invalid date format');
  }
  
  // Remove time component for accurate date comparison
  currentDate.setHours(0, 0, 0, 0);
  
  if (eventDate > currentDate) {
    throw new Error('Event date cannot be in the future');
  }
  
  if (eventDate < minDate) {
    throw new Error('Event date cannot be before 2010');
  }
  
  return true;
};

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

        // Add date validation here
        validateEventDate(eventData.date);

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

const updatePendingEvent = async (eventId, studentId, eventData) => {
    try {
        // Find the event and verify ownership and status
        const event = await Event.findById(eventId);
        
        if (!event) {
            return { success: false, error: 'Event not found' };
        }
        
        if (event.submittedBy.toString() !== studentId.toString()) {
            return { success: false, error: 'You can only edit your own events' };
        }
        
        if (event.status !== 'Pending') {
            return { success: false, error: 'Only pending events can be edited' };
        }
        
        // Add date validation if date is being updated
        if (eventData.date) {
            try {
                validateEventDate(eventData.date);
            } catch (error) {
                return { success: false, error: error.message };
            }
        }
        
        // Get form configuration
        const config = await FormFieldConfig.findOne({ category: eventData.category });
        if (!config) {
            return { success: false, error: 'No form configuration found for this category' };
        }
        
        // Define fields that shouldn't be updated directly
        const protectedFields = ['_id', 'submittedBy', 'status', 'approvedBy', 'pointsEarned'];
        
        // Define control fields that should be processed but not saved to the model
        const controlFields = ['keepExistingCertificates', 'keepExistingPdf'];
        
        // Update event fields dynamically
        Object.keys(eventData).forEach(key => {
            // Skip protected and control fields
            if (!protectedFields.includes(key) && !controlFields.includes(key)) {
                event[key] = eventData[key];
            }
        });
        
        // Also update dynamicFields when customAnswers are updated
        if (eventData.customAnswers) {
            // Log the incoming custom answers for debugging
            console.log('Updating dynamicFields with customAnswers:', eventData.customAnswers);
            
            // Create a new Map instead of a plain object
            const newDynamicFields = new Map();
            
            // Preserve any existing non-customAnswer fields
            if (event.dynamicFields instanceof Map) {
                for (const [key, value] of event.dynamicFields.entries()) {
                    if (!key.startsWith('customAnswer_')) {
                        newDynamicFields.set(key, value);
                    }
                }
            } else if (event.dynamicFields) {
                // Handle if dynamicFields is already an object
                Object.entries(event.dynamicFields).forEach(([key, value]) => {
                    if (!key.startsWith('customAnswer_')) {
                        newDynamicFields.set(key, value);
                    }
                });
            }
            
            // Add the new custom answer values
            if (eventData.customAnswers instanceof Map) {
                for (const [key, value] of eventData.customAnswers.entries()) {
                    newDynamicFields.set(`customAnswer_${key}`, value);
                }
            } else {
                // Handle if customAnswers is a regular object
                Object.entries(eventData.customAnswers).forEach(([key, value]) => {
                    newDynamicFields.set(`customAnswer_${key}`, value);
                });
            }
            
            // Set the dynamicFields to the new Map
            event.dynamicFields = newDynamicFields;
            
            // Log the updated dynamicFields
            console.log('Updated dynamicFields:', event.dynamicFields);
        }
        
        // Save the updated event
        const updatedEvent = await event.save();
        return { success: true, data: updatedEvent };
    } catch (error) {
        console.error(`Failed to update pending event: ${error.message}`);
        return { success: false, error: error.message };
    }
};

module.exports = { 
    createEvent, 
    reviewEvent, 
    editEventStatus, 
    getEventById,
    updatePendingEvent // Export the new method
};
