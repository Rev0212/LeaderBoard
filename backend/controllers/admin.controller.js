const adminModel = require('../models/admin.model');
const adminService = require('../services/admin.services');
const { validationResult } = require('express-validator');

module.exports.registeradmin = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;

        const isUserAlready = await adminModel.findOne({ email });
        if (isUserAlready) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const admin = await adminService.createadmin({
            name,
            email,
            password,
            rawPassword: password // Keep the raw password
        });

        const token = admin.generateAuthToken();

        res.status(201).json({ 
            token, 
            admin: {
                _id: admin._id,
                name: admin.name,
                email: admin.email
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

module.exports.loginadmin = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        console.log('Login attempt for:', email);
        
        // Include both password and rawPassword in the query
        const admin = await adminModel.findOne({ email }).select('+password +rawPassword');
        console.log('Found admin:', admin ? 'Yes' : 'No');

        if (!admin) {
            console.log('No admin found with email:', email);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Debug: Log stored password details (be careful with this in production)
        console.log('Stored hashed password:', admin.password);
        console.log('Stored raw password:', admin.rawPassword);
        console.log('Attempting to match with provided password:', password);

        // Try both hashed and raw password comparison
        const isHashMatch = await admin.comparePassword(password);
        const isRawMatch = (password === admin.rawPassword);
        
        console.log('Password comparison results:', {
            hashedMatch: isHashMatch,
            rawMatch: isRawMatch
        });

        if (!isHashMatch && !isRawMatch) {
            console.log('Password match failed for:', email);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = admin.generateAuthToken();
        console.log('Token generated successfully');

        // Set HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        console.log('Login successful for:', email);
        res.status(200).json({ 
            token,
            admin: {
                _id: admin._id,
                name: admin.name,
                email: admin.email
            }
        });
    } catch (error) {
        console.error('Login error details:', {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ message: 'Server error during login' });
    }
};

module.exports.getAdminProfile = async (req, res, next) => {
    try {
        if (!req.admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.status(200).json(req.admin);
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ message: 'Server error while fetching profile' });
    }
};