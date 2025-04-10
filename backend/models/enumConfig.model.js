const mongoose = require('mongoose');

const enumConfigSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['category', 'positionSecured', 'eventLocation', 'eventScope', 'eventOrganizer', 'participationType', 'status'],
    unique: true
  },
  values: [{
    type: String,
    required: true
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin' 
  }
}, { timestamps: true });

const EnumConfig = mongoose.model('EnumConfig', enumConfigSchema);

module.exports = EnumConfig;