const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true,
        select: false
    },
    rawPassword: { 
        type: String,
        select: false // Hide raw password from queries by default
    }
}, {
    timestamps: true
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

adminSchema.methods.generateAuthToken = function () {
    try {
        const token = jwt.sign(
            { _id: this._id, email: this.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        return token;
    } catch (error) {
        throw new Error('Error generating token');
    }
};

adminSchema.methods.comparePassword = async function (password) {
    try {
        console.log('Comparing passwords:');
        console.log('Input password length:', password.length);
        console.log('Stored hash length:', this.password.length);
        
        const result = await bcrypt.compare(password, this.password);
        console.log('bcrypt comparison result:', result);
        return result;
    } catch (error) {
        console.error('Password comparison error:', error);
        throw new Error('Error comparing passwords');
    }
};

const Admin = mongoose.model('admin', adminSchema);

module.exports = Admin;