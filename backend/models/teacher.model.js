const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const teacherSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Hashed password
    rawPassword: { type: String }, // Unhashed password
    profileImg: { type: String, default: null },
    registerNo: { type: String, required: true, unique: true },
    classes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    }]
});

// Method: Generate Auth Token
teacherSchema.methods.generateAuthToken = function () {
    const token = jwt.sign(
        { _id: this._id, email: this.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
    return token;
};

// Method: Compare Password
teacherSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Static Method: Hash Password
teacherSchema.statics.hashedPassword = async function (password) {
    return await bcrypt.hash(password, 10);
};

const teacherModel = mongoose.model('teacher', teacherSchema);

module.exports = teacherModel;
