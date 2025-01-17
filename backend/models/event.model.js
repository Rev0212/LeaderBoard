const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

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
        enum: ['Hackathon', 'Ideathon', 'Coding', 'Global-Certificates', 'Workshop', 'Conference', 'Others'],
        required: true
    },
    eventLocation: {
        type: String,
        enum: ['Within College', 'Outside College'],
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
        enum: ['First', 'Second', 'Third', 'Participant', 'None'],
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

// Add indexes for frequent queries
eventSchema.index({ submittedBy: 1 });
eventSchema.index({ approvedBy: 1 });
eventSchema.index({ status: 1 });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
