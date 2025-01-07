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

module.exports.addProfileImg = async (registerNo, profileImg) => {
    try {
        const updatedStudent = await studentModel.findOneAndUpdate(
            { registerNo }, 
            { profileImg: profileImg }, 
            { new: true } // Return the updated document
        );

        if (!updatedStudent) {
            throw new Error("Student not found with the given registerNo");
        }

        return updatedStudent;
    } catch (error) {
        console.error("Error updating profile image:", error);
        throw error;
    }
}


module.exports.changePassword = async (studentId, oldPassword, newPassword) => {
    try {
        const student = await studentModel.findById(studentId).select('+password'); 
        if (!student) {
            throw new Error("Student not found");
        }
        else if (!await student.comparePassword(oldPassword)) {
             throw new Error("Invalid password");
         }

        const hashedPassword = await studentModel.hashedPassword(newPassword);
        student.password = hashedPassword;
        await student.save();
        return student;
    } catch (error) {
        console.error("Error changing password:", error);
        throw error;
    }
}