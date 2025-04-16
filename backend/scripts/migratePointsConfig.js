const mongoose = require('mongoose');
const PointsConfig = require('../models/pointsConfig.model');
const Admin = require('../models/admin.model');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function migratePointsConfiguration() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DB_CONNECT);
    console.log('🔗 Connected to MongoDB');

    // Load the configuration from making.json
    const configPath = path.join(__dirname, 'making.json');
    const rawConfig = fs.readFileSync(configPath);
    const newConfiguration = JSON.parse(rawConfig);

    // Find an admin user to set as the updater
    const admin = await Admin.findOne();
    if (!admin) {
      throw new Error('No admin found in the database');
    }

    // Deactivate current active configuration
    await PointsConfig.updateMany(
      { isActive: true },
      { 
        $set: { 
          isActive: false,
          notes: 'Deactivated during migration to new scoring system'
        }
      }
    );

    // Create new configuration
    const newPointsConfig = new PointsConfig({
      configType: 'categoryRules',
      configuration: newConfiguration,
      version: 3,
      isActive: true,
      updatedBy: admin._id,
      notes: 'Initial migration from detailed marking scheme'
    });

    await newPointsConfig.save();

    console.log('✅ Points configuration migrated successfully');
    console.log('📊 Categories migrated:', Object.keys(newConfiguration));
    console.log('🔄 Previous configurations deactivated');
    console.log('📝 New configuration version:', newPointsConfig.version);

  } catch (error) {
    console.error('❌ Error during migration:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the migration
migratePointsConfiguration();