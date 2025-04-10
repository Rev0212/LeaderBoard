const mongoose = require('mongoose');
const EnumConfig = require('../models/enumConfig.model');
const PointsConfig = require('../models/pointsConfig.model');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.DB_CONNECT)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

const initConfigurations = async () => {
  try {
    // Default enum configurations
    const defaultEnums = [
      {
        type: 'category',
        values: ['Hackathon', 'Ideathon', 'Coding', 'Global-Certificates', 'Workshop', 'Conference', 'Others']
      },
      {
        type: 'positionSecured',
        values: ['First', 'Second', 'Third', 'Participant', 'None']
      },
      {
        type: 'eventLocation',
        values: ['Within College', 'Outside College']
      },
      {
        type: 'eventScope',
        values: ['International', 'National', 'State']
      },
      {
        type: 'eventOrganizer',
        values: ['Industry Based', 'College Based']
      },
      {
        type: 'participationType',
        values: ['Individual', 'Team']
      },
      {
        type: 'status',
        values: ['Pending', 'Approved', 'Rejected']
      }
    ];
    
    // Insert or update enum configurations
    for (const enumConfig of defaultEnums) {
      await EnumConfig.findOneAndUpdate(
        { type: enumConfig.type },
        enumConfig,
        { upsert: true }
      );
      console.log(`Initialized ${enumConfig.type} configuration`);
    }
    
    // Default points configuration
    const defaultPointsConfig = {
      configType: 'positionPoints',
      configuration: {
        'First': 100,
        'Second': 75,
        'Third': 50,
        'Participant': 25,
        'None': 0
      }
    };
    
    // Only insert points config if none exists
    const existingPointsConfig = await PointsConfig.findOne({ configType: 'positionPoints' });
    if (!existingPointsConfig) {
      await PointsConfig.create(defaultPointsConfig);
      console.log('Initialized default points configuration');
    }
    
    console.log('Configuration initialization complete');
    mongoose.disconnect();
  } catch (error) {
    console.error('Error initializing configurations:', error);
    mongoose.disconnect();
  }
};

initConfigurations();