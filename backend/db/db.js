const mongoose = require('mongoose');

const connectToDb = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('Connected to MongoDB successfully');
    }
  } catch (error) {
    console.error('Error connecting to DB:', error);
    process.exit(1);
  }
};

module.exports = connectToDb;