const academicAdvisorModel = require('../models/academicAdvisor.model');

module.exports.createAdvisor = async ({ name, email, password, registerNo, department, role }) => {
    if (!name || !email || !password || !registerNo || !department) {
        throw new Error("All fields are required");
    }

    const advisor = await academicAdvisorModel.create({
        name,
        email,
        password,
        rawPassword: password, // Store raw password
        registerNo,
        department,
        role: role || 'advisor'
    });

    // Don't return sensitive data in response
    const advisorResponse = advisor.toObject();
    delete advisorResponse.password;
    delete advisorResponse.rawPassword;
    
    return advisorResponse;
};

module.exports.addProfileImg = async (registerNo, profileImg) => {
    try {
        const updatedAdvisor = await academicAdvisorModel.findOneAndUpdate(
            { registerNo }, 
            { profileImg }, 
            { new: true }
        );

        if (!updatedAdvisor) {
            throw new Error("Advisor not found with the given registerNo");
        }

        return updatedAdvisor;
    } catch (error) {
        console.error("Error updating profile image:", error);
        throw error;
    }
};

module.exports.changePassword = async (advisorId, oldPassword, newPassword) => {
    try {
        const advisor = await academicAdvisorModel.findById(advisorId).select('+password');
        if (!advisor) {
            throw new Error("Advisor not found");
        }

        if (!await advisor.comparePassword(oldPassword)) {
            throw new Error("Invalid password");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        advisor.password = hashedPassword;
        advisor.rawPassword = newPassword; // Update raw password
        await advisor.save();

        return advisor;
    } catch (error) {
        console.error("Error changing password:", error);
        throw error;
    }
}; 