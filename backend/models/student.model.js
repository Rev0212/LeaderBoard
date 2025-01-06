const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    profileImg: { type: String, default: null },
    email: { type: String, required: true, unique: true },
    registerNo:{type: String, required:true, unique: true},
    password: { type: String, required: true, select: false },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    },
    totalPoints: {
        type: Number,
        default: 0
    },
    eventsParticipated: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    }]
});

// Instance Method: Generate Auth Token
studentSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    return token;
};

// Instance Method: Compare Passwords
studentSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Static Method: Hash Password
studentSchema.statics.hashedPassword = async function (password) {
    return await bcrypt.hash(password, 10);
};

const studentModel = mongoose.model('student', studentSchema);

module.exports = studentModel;
