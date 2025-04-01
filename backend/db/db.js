const mongoose = require('mongoose');

const connectToDb = async () => {
  try {
    if (!process.env.DB_CONNECT) {
      throw new Error('DB_CONNECT is not defined in environment variables');
    }
    
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.DB_CONNECT);
      console.log('Connected to MongoDB successfully');
    }
  } catch (error) {
    console.error('Error connecting to DB:', error);
    process.exit(1);
  }
};

module.exports = connectToDb;
