const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  config: {
    type: Object,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, { timestamps: true });

// Compound index to ensure unique templates per category
templateSchema.index({ category: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Template', templateSchema);