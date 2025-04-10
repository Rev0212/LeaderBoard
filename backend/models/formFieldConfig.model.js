const mongoose = require('mongoose');

const formFieldConfigSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    unique: true
  },
  requiredFields: [String],
  optionalFields: [String],
  conditionalFields: {
    type: Map,
    of: {
      dependsOn: String,
      showWhen: [String]
    }
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const FormFieldConfig = mongoose.model('FormFieldConfig', formFieldConfigSchema);

module.exports = FormFieldConfig;