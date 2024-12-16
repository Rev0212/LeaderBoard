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
        default: Date.now
    },
    proofUrl: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    category: {
        type: String,
        enum: ['Hackathon', 'Ideathon', 'Coding', 'Other'],
        required: true
    },
    positionSecured: {
        type: String,
        enum: ['First', 'Second', 'Third', 'Participated', null],
        default: null
    },
    pointsEarned: {
        type: Number,
        default: 0
    },
    submittedBy: {
        type: ObjectId,
        ref: 'Student',
        required: true
    },
    approvedBy: {
        type: ObjectId,
        ref: 'Teacher'
    }
});

// Add indexes for frequent queries
eventSchema.index({ submittedBy: 1 });
eventSchema.index({ approvedBy: 1 });
eventSchema.index({ status: 1 });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
