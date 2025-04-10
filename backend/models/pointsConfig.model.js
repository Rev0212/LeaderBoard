const mongoose = require('mongoose');

const pointsConfigSchema = new mongoose.Schema({
  configType: {
    type: String,
    required: true,
    enum: ['positionPoints', 'categoryRules'],
    default: 'positionPoints'
  },
  configuration: {
    type: mongoose.Schema.Types.Mixed, // Changed from Map to Mixed to support nested structures
    required: true
    // Now supports hierarchical structures like:
    // {
    //   "Hackathon": {
    //     "Team": {
    //       "International": {
    //         "Industry Based": { "First": 200, "Second": 150 }
    //       }
    //     }
    //   }
    // }
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

// Get current active configuration
pointsConfigSchema.statics.getCurrentConfig = async function(configType = 'positionPoints') {
  return await this.findOne({ configType, isActive: true })
    .sort({ effectiveDate: -1, version: -1 })
    .lean();
};

const PointsConfig = mongoose.model('PointsConfig', pointsConfigSchema);

module.exports = PointsConfig;