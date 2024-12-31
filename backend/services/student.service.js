const { model } = require('mongoose')
const studentModel = require('../models/student.model')

module.exports.createStudent = async ({ name, email, password, registerNo }) => {
    if (!name || !email || !password || !registerNo) {
        throw new Error("All fields are required");
    }

    const student = await studentModel.create({
        name,
        email,
        password: password,
        registerNo
    });

    return student;
};