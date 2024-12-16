const { model } = require('mongoose')
const adminModel = require('../models/admin.model')

module.exports.createadmin = async ({ name, email, password }) => {
    if (!name || !email || !password) {
        throw new Error("All fields are required");
    }

    const admin = await adminModel.create({
        name,
        email,
        password: password
    });

    return admin;
};