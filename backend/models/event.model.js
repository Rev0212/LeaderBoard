const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;
const EnumConfig = require('./enumConfig.model');

const eventSchema = new mongoose.Schema({
    eventName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true
    },
    proofUrl: {
        type: String,
        required: true
    },
    pdfDocument: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    eventLocation: {
        type: String,
        required: function() {
            return ['Hackathon', 'Ideathon', 'Coding', 'Workshop', 'Conference'].includes(this.category);
        }
    },
    otherCollegeName: {
        type: String,
        required: function() {
            return this.eventLocation === 'Outside College';
        }
    },
    eventScope: {
        type: String,
        enum: ['International', 'National', 'State'],
        required: function() {
            return ['Hackathon', 'Ideathon', 'Coding', 'Workshop', 'Conference'].includes(this.category);
        }
    },
    eventOrganizer: {
        type: String,
        enum: ['Industry Based', 'College Based'],
        required: function() {
            return ['Hackathon', 'Ideathon', 'Coding', 'Workshop', 'Conference'].includes(this.category);
        }
    },
    participationType: {
        type: String,
        enum: ['Individual', 'Team'],
        required: function() {
            return ['Hackathon', 'Ideathon', 'Coding', 'Workshop', 'Conference'].includes(this.category);
        }
    },
    positionSecured: {
        type: String,
        required: true
    },
    priceMoney: {
        type: Number,
        required: function() {
            return ['First', 'Second', 'Third'].includes(this.positionSecured);
        }
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    pointsEarned: {
        type: Number,
        default: 0
    },
    submittedBy: {
        type: ObjectId,
        ref: 'student',
        required: true
    },
    approvedBy: {
        type: ObjectId,
        ref: 'teacher'
    }
}, {
    timestamps: true
});

// Add pre-validation middleware to check dynamic enums
eventSchema.pre('validate', async function(next) {
    try {
        // Validate category
        if (this.category) {
            const categoryConfig = await EnumConfig.findOne({ type: 'category' });
            if (categoryConfig && !categoryConfig.values.includes(this.category)) {
                this.invalidate('category', `${this.category} is not a valid category`);
            }
        }
        
        // Validate eventLocation
        if (this.eventLocation) {
            const locationConfig = await EnumConfig.findOne({ type: 'eventLocation' });
            if (locationConfig && !locationConfig.values.includes(this.eventLocation)) {
                this.invalidate('eventLocation', `${this.eventLocation} is not a valid event location`);
            }
        }
        
        // Validate positionSecured
        if (this.positionSecured) {
            const positionConfig = await EnumConfig.findOne({ type: 'positionSecured' });
            if (positionConfig && !positionConfig.values.includes(this.positionSecured)) {
                this.invalidate('positionSecured', `${this.positionSecured} is not a valid position`);
            }
        }
        
        // Add similar validations for other enum fields
        
        next();
    } catch (err) {
        next(err);
    }
});

// Add indexes for frequent queries
eventSchema.index({ submittedBy: 1 });
eventSchema.index({ approvedBy: 1 });
eventSchema.index({ status: 1 });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
