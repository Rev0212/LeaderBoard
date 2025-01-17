const adminModel = require('../models/admin.model');

module.exports.createadmin = async ({ name, email, password, rawPassword }) => {
    if (!name || !email || !password) {
        throw new Error("All fields are required");
    }

    const admin = await adminModel.create({
        name,
        email,
        password,
        rawPassword
    });

    // Don't return sensitive data in response
    const adminResponse = admin.toObject();
    delete adminResponse.password;
    delete adminResponse.rawPassword;
    
    return adminResponse;
};