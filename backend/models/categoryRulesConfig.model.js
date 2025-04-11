const mongoose = require('mongoose');

const categoryRulesConfigSchema = new mongoose.Schema({
  configuration: {
    type: mongoose.Schema.Types.Mixed, 
    required: true
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

// Only one active configuration should exist
categoryRulesConfigSchema.statics.getCurrentConfig = async function() {
  return await this.findOne({ isActive: true })
    .sort({ effectiveDate: -1, version: -1 })
    .lean();
};

const CategoryRulesConfig = mongoose.model('CategoryRulesConfig', categoryRulesConfigSchema);

module.exports = CategoryRulesConfig;