const mongoose = require('mongoose');
const FormFieldConfig = require('../models/formFieldConfig.model');
require('dotenv').config();

async function checkExistingConfigs() {
    try {
        await mongoose.connect(process.env.DB_CONNECT);
        console.log('Connected to MongoDB');

        const existingConfigs = await FormFieldConfig.find({});
        console.log('\nExisting Form Configurations:');
        existingConfigs.forEach(config => {
            console.log(`\nCategory: ${config.category}`);
            console.log('Required Fields:', config.requiredFields);
            console.log('Optional Fields:', config.optionalFields);
            console.log('Custom Questions:', config.customQuestions?.length || 0);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

checkExistingConfigs();