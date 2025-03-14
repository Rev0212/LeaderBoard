const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    profileImg: { type: String, default: null },
    email: { type: String, required: true, unique: true },
    registerNo: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    rawPassword: { type: String }, // Store raw password
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    },
    //added curnt year , course , isGraduvated Fields
    year: { type: Number, required: true }, 
    course: { type: String, required: true, enum: ['BTech', 'MTech'] },
    totalPoints: {
        type: Number,
        default: 0
    },
    eventsParticipated: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    }],
    isActive: { type: Boolean, default: true },
    isGraduated: { type: Boolean, default: false },
    isArchived:{ type: Boolean, default: false }
});

studentSchema.virtual('graduationYear').get(function () {
    return this.course === 'MTech' ? 5 : 4; // MTech students graduate in year 5, others in year 4
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
