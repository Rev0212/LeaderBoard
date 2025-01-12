const adminModel = require('../models/admin.model');
const adminService = require('../services/admin.services');
const { validationResult } = require('express-validator');


module.exports.registeradmin = async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    const isUserAlready = await adminModel.findOne({ email });

    if (isUserAlready) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await adminModel.hashPassword(password);

    const admin = await adminService.createadmin({
        name,
        email,
        password: hashedPassword, // Hashed password
        rawPassword: password // Save the raw (unhashed) password
    });

    const token = admin.generateAuthToken();

    res.status(201).json({ token, admin });
};


module.exports.loginadmin = async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    

    const admin = await adminModel.findOne({ email }).select('+password');


    if (!admin) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await admin.comparePassword(password);


    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid password' });
    }

    const token = admin.generateAuthToken();

    res.cookie('token', token);

    res.status(200).json({ token, admin });
}

module.exports.getAdminProfile = async (req, res, next) => {
    if (!req.admin) {
        return res.status(404).json({ message: 'admin not found' });
    }
    res.status(200).json(req.admin);
}
