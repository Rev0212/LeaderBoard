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

module.exports.addProfileImg = async (registerNo, profileImg) => {
    try {
        const updatedTeacher = await teacherModel.findOneAndUpdate(
            { registerNo }, 
            { profileImg: profileImg }, 
            { new: true } // Return the updated document
        );

        if (!updatedTeacher) {
            throw new Error("Teacher not found with the given registerNo");
        }

        return updatedTeacher;
    } catch (error) {
        console.error("Error updating profile image:", error);
        throw error;
    }
}

module.exports.changePassword = async (teacherId, oldPassword, newPassword) => {
    try {
        const teacher = await teacherModel.findById(teacherId).select('+password'); 
        if (!teacher) {
            throw new Error("Teacher not found");
        }
        else if (!await teacher.comparePassword(oldPassword)) {
             throw new Error("Invalid password");
         }

        const hashedPassword = await teacherModel.hashedPassword(newPassword);
        teacher.password = hashedPassword;
        await teacher.save();
        return teacher;
    } catch (error) {
        console.error("Error changing password:", error);
        throw error;
    }
}