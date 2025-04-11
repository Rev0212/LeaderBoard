const mongoose = require('mongoose');

const formFieldConfigSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        unique: true
    },
    requiredFields: [{
        type: String
    }],
    optionalFields: [{
        type: String
    }],
    proofConfig: {
        requireCertificateImage: Boolean,
        requirePdfProof: Boolean,
        maxCertificateSize: Number,
        allowMultipleCertificates: Boolean
    },
    customQuestions: [{
        id: String,
        text: String,
        type: {
            type: String,
            enum: ['text', 'singleChoice', 'multipleChoice']
        },
        required: Boolean,
        options: [String]
    }]
}, { timestamps: true });

module.exports = mongoose.model('FormFieldConfig', formFieldConfigSchema);