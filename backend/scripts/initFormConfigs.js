const mongoose = require('mongoose');
const FormFieldConfig = require('../models/formFieldConfig.model');
require('dotenv').config();

async function checkAndInitializeConfigs() {
    try {
        await mongoose.connect(process.env.DB_CONNECT);
        console.log('Connected to MongoDB');

        // Check if configurations already exist
        const existingConfigs = await FormFieldConfig.find({});
        
        if (existingConfigs && existingConfigs.length > 0) {
            console.log('Configurations already exist in database. No need to reinitialize.');
            console.log(`Found ${existingConfigs.length} existing configurations`);
            return;
        }

        // If no configurations exist, initialize from templates.js
        const Template = require('../models/template.model');
        const templates = await Template.find({});

        if (templates && templates.length > 0) {
            console.log('Using existing templates to create form configurations...');
            
            for (const template of templates) {
                const formConfig = {
                    category: template.category,
                    requiredFields: template.requiredFields,
                    optionalFields: template.optionalFields,
                    proofConfig: template.proofConfig,
                    customQuestions: template.customQuestions
                };

                await FormFieldConfig.create(formConfig);
                console.log(`Configuration created for ${template.category}`);
            }
        } else {
            console.log('No existing templates found. Please run initializeTemplates.js first');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

checkAndInitializeConfigs();