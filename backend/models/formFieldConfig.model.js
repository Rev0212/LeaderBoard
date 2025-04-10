const mongoose = require('mongoose');

const customQuestionSchema = new mongoose.Schema({
  id: String,
  text: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'singleChoice', 'multipleChoice'],
    default: 'text'
  },
  required: {
    type: Boolean,
    default: true
  },
  options: [String] // For choice questions
});

const proofConfigSchema = new mongoose.Schema({
  requireCertificateImage: {
    type: Boolean,
    default: false
  },
  requirePdfProof: {
    type: Boolean,
    default: true
  },
  maxCertificateSize: {
    type: Number,
    default: 5
  },
  maxPdfSize: {
    type: Number,
    default: 10
  },
  allowMultipleCertificates: {
    type: Boolean,
    default: false
  }
}, { _id: false });

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
  proofConfig: {
    type: proofConfigSchema,
    default: () => ({})
  },
  customQuestions: {
    type: [customQuestionSchema],
    default: []
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