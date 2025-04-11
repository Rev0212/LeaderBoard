const mongoose = require('mongoose');
const FormFieldConfig = require('../models/formFieldConfig.model');
const Template = require('../models/template.model');
const EnumConfig = require('../models/enumConfig.model');
require('dotenv').config();

async function fixFormConfigurations() {
    try {
        await mongoose.connect(process.env.DB_CONNECT);
        console.log('Connected to MongoDB');

        // Get all available categories
        const categoryEnum = await EnumConfig.findOne({ type: 'category' });
        const categories = categoryEnum ? categoryEnum.values : [];
        console.log('Available categories:', categories);
        
        // Get existing form configurations
        const existingConfigs = await FormFieldConfig.find({});
        console.log(`Found ${existingConfigs.length} existing configurations`);
        
        const existingConfigCategories = existingConfigs.map(config => config.category);
        console.log('Existing configuration categories:', existingConfigCategories);
        
        // Find missing categories
        const missingCategories = categories.filter(cat => !existingConfigCategories.includes(cat));
        console.log('Missing configurations for categories:', missingCategories);
        
        // Create configurations for missing categories
        for (const category of missingCategories) {
            // Try to find a template for this category
            const template = await Template.findOne({ category });
            
            if (template) {
                console.log(`Creating config for ${category} from template`);
                const formConfig = {
                    category: template.category,
                    requiredFields: template.requiredFields || [],
                    optionalFields: template.optionalFields || [],
                    proofConfig: template.proofConfig || {
                        requireCertificateImage: true,
                        requirePdfProof: true,
                        maxCertificateSize: 5,
                        maxPdfSize: 10,
                        allowMultipleCertificates: false
                    },
                    customQuestions: template.customQuestions || []
                };
                
                await FormFieldConfig.create(formConfig);
                console.log(`Configuration created for ${category}`);
            } else {
                console.log(`No template found for ${category}, creating default config`);
                const defaultConfig = {
                    category: category,
                    requiredFields: ['title', 'date', 'description', 'positionSecured'],
                    optionalFields: ['eventLocation', 'eventScope', 'eventOrganizer'],
                    proofConfig: {
                        requireCertificateImage: true,
                        requirePdfProof: true,
                        maxCertificateSize: 5,
                        maxPdfSize: 10,
                        allowMultipleCertificates: false
                    },
                    customQuestions: []
                };
                
                await FormFieldConfig.create(defaultConfig);
                console.log(`Default configuration created for ${category}`);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

fixFormConfigurations();