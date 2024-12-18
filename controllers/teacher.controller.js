const teacherModel = require('../models/teacher.model');
const teacherService = require('../services/teacher.service');
const { validationResult } = require('express-validator');


module.exports.registerTeacher = async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;


    const isUserAlready = await teacherModel.findOne({ email });

    if (isUserAlready) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await teacherModel.hashedPassword(password);

    const teacher = await teacherService.createTeacher({
        name,
        email,
        password: hashedPassword
    });

    res.cookie('token', token);

    const token = teacher.generateAuthToken();

    res.status(201).json({ token, teacher });
}

module.exports.loginTeacher = async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const teacher = await teacherModel.findOne({ email }).select('+password');

    if (!teacher) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await teacher.comparePassword(password);

    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid password' });
    }

    const token = teacher.generateAuthToken();

    res.cookie('token', token);

    res.status(200).json({ token, teacher });
}

module.exports.getProfile = async (req, res, next) => {

    res.status(200).json(req.teacher);
}
