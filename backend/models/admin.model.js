const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    rawPassword: { type: String }, // Field to store the unhashed password
});


adminSchema.methods.generateAuthToken = function () {
    const token = jwt.sign(
        { _id: this._id, email: this.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
    return token;
};

adminSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

adminSchema.statics.hashPassword = async function (password) {
    return await bcrypt.hash(password, 10);
};

const adminModel = mongoose.model('admin', adminSchema);

module.exports = adminModel;
