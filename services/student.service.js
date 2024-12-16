const { model } = require('mongoose')
const studentModel = require('../models/student.model')

module.exports.createStudent = async ({ name, email, password }) => {
    if (!name || !email || !password) {
        throw new Error("All fields are required");
    }

    const student = await studentModel.create({
        name,
        email,
        password: password
    });

    return student;
};