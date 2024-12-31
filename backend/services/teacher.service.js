const { model } = require('mongoose')
const teacherModel = require('../models/teacher.model')

module.exports.createTeacher = async ({ name, email, password,registerNo }) => {
    if (!name || !email || !password) {
        throw new Error("All fields are required");
    }

    const teacher = await teacherModel.create({
        name,
        email,
        password: password,
        registerNo, 
    });

    return teacher;
};