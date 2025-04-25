const mongoose = require('mongoose');
const EnumConfig = require('../models/enumConfig.model');
require('dotenv').config();

const updateCategoryEnum = async () => {
  try {
    await mongoose.connect(process.env.DB_CONNECT);
    console.log('Connected to MongoDB');
    
    // Set categories to match exactly what's in your configuration
    const configuredCategories = [
      'Hackathon', 
      'Coding Competitions', 
      'Open Source', 
      'Research', 
      'Certifications', 
      'NCC_NSS_YRC', 
      'Sports',
      'Workshops', 
      'Student Leadership', 
      'Social Work & Community Impact'
    ];
    
    // Update the category enum values
    const result = await EnumConfig.findOneAndUpdate(
      { type: 'category' },
      { 
        values: configuredCategories,
        lastUpdated: new Date()
      },
      { new: true }
    );
    
    console.log('Updated category enum:');
    console.log('Previous categories removed: "Ideathon", "Conference", "Others"');
    console.log('Current categories:', result.values);
    
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error updating category enum:', error);
    mongoose.disconnect();
  }
};

updateCategoryEnum();