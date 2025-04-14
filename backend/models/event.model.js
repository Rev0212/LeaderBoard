const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;
const FormFieldConfig = require('./formFieldConfig.model');

const eventSchema = new mongoose.Schema({
    eventName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true
    },
    proofUrl: {
        type: [String], // Changed to array of strings
        required: true,
        validate: {
            validator: async function(urls) {
                const category = this.category;
                if (!category) return false;
                
                // Get form configuration for this category
                const config = await FormFieldConfig.findOne({ category });
                if (!config) return true; // If no config, don't validate
                
                const { proofConfig } = config;
                
                // Validate based on proof configuration
                if (proofConfig?.requireCertificateImage) {
                    return urls && urls.length > 0;
                }
                return true;
            },
            message: 'Certificate proof is required'
        }
    },
    pdfDocument: {
        type: String,
        required: false // Default to not required
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    category: {
        type: String,
        required: true
    },
    customAnswers: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    },
    dynamicFields: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: () => new Map()
    },
    pointsEarned: {
        type: Number,
        default: 0
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
        required: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacher',
        required: false // Not required because it's only set when a teacher approves
    }
}, { timestamps: true });

// Add method to validate PDF requirement
eventSchema.methods.validatePdfRequired = async function() {
    if (!this.category) return false;
    
    const config = await FormFieldConfig.findOne({ category: this.category });
    if (!config) return false;
    
    return config.proofConfig?.requirePdfProof || false;
};

// Pre-save middleware to validate required fields
eventSchema.pre('validate', async function(next) {
    try {
        const config = await FormFieldConfig.findOne({ category: this.category });
        if (!config) return next();

        // Validate static required fields (excluding proofUrl and pdfDocument)
        for (const field of config.requiredFields) {
            if (!['proofUrl', 'pdfDocument'].includes(field)) {
                // Check both root level and inside dynamicFields Map
                const valueExists = 
                    this[field] !== undefined || 
                    (this.dynamicFields && this.dynamicFields.get(field) !== undefined);
                
                if (!valueExists) {
                    this.invalidate(field, `${field} is required`);
                }
            }
        }

        // Add PDF document validation here - this is the key fix
        if (config.proofConfig?.requirePdfProof && !this.pdfDocument) {
            this.invalidate('pdfDocument', 'PDF document is required for this category');
        }

        // Validate custom questions (inside customAnswers)
        if (config.customQuestions) {
            const requiredQuestions = config.customQuestions.filter(q => q.required);
            for (const question of requiredQuestions) {
                const answer = this.customAnswers?.get(question.id);
                if (answer === undefined || answer === null || answer === '') {
                    this.invalidate(`customAnswers.${question.id}`, `Answer for "${question.text}" is required`);
                }
            }
        }

        // ✅ Validate dynamic fields
        if (config.dynamicFields) {
            const requiredDynamicFields = config.dynamicFields.filter(field => field.required);
            for (const field of requiredDynamicFields) {
                const value = this.dynamicFields?.get(field.name);
                if (value === undefined || value === null || value === '') {
                    this.invalidate(`dynamicFields.${field.name}`, `Dynamic field "${field.label || field.name}" is required`);
                }
            }
        }

        next();
    } catch (error) {
        next(error);
    }
});

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
