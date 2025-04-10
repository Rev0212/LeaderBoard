const mongoose = require('mongoose');

const pointsConfigSchema = new mongoose.Schema({
  configType: {
    type: String,
    required: true,
    enum: ['positionPoints', 'categoryMultipliers'],
    default: 'positionPoints'
  },
  configuration: {
    type: Map,
    of: Number,
    required: true
    // e.g. { "First": 100, "Second": 75, "Third": 50 }
  },
  effectiveDate: {
    type: Date,
    default: Date.now
  },
  version: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  notes: String
}, { timestamps: true });

// Add a static method to get the current active configuration
pointsConfigSchema.statics.getCurrentConfig = async function(configType = 'positionPoints') {
  return await this.findOne({ configType, isActive: true })
    .sort({ effectiveDate: -1, version: -1 })
    .lean();
};

const PointsConfig = mongoose.model('PointsConfig', pointsConfigSchema);

module.exports = PointsConfig;