const mongoose = require('mongoose');
const EnumConfig = require('../models/enumConfig.model');
require('dotenv').config();

async function addConferenceCategory() {
  try {
    await mongoose.connect(process.env.DB_CONNECT);
    console.log('Connected to MongoDB');
    
    const categoryEnum = await EnumConfig.findOne({ type: 'category' });
    
    if (categoryEnum) {
      if (!categoryEnum.values.includes('Conference')) {
        categoryEnum.values.push('Conference');
        await categoryEnum.save();
        console.log('Added "Conference" to category enum values');
      } else {
        console.log('"Conference" already exists in category enum values');
      }
    } else {
      console.log('Category enum not found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

addConferenceCategory();