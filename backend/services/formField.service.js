const FormFieldConfig = require('../models/formFieldConfig.model');

class FormFieldService {
  /**
   * Get form fields configuration for a category
   */
  static async getFieldsForCategory(category) {
    const config = await FormFieldConfig.findOne({ category }).lean();
    
    if (!config) {
      return this.getDefaultFields();
    }
    
    return {
      requiredFields: config.requiredFields || [],
      optionalFields: config.optionalFields || [],
      conditionalFields: config.conditionalFields || {},
      proofConfig: config.proofConfig || {
        requireCertificateImage: false,
        requirePdfProof: true,
        maxCertificateSize: 5,
        maxPdfSize: 10,
        allowMultipleCertificates: false
      },
      customQuestions: config.customQuestions || []
    };
  }
  
  /**
   * Get default form fields
   */
  static getDefaultFields() {
    return {
      requiredFields: ['title', 'date', 'category', 'positionSecured'],
      optionalFields: ['eventLocation', 'eventScope', 'eventOrganizer', 'participationType', 'priceMoney'],
      conditionalFields: {
        'priceMoney': {
          dependsOn: 'positionSecured',
          showWhen: ['First', 'Second', 'Third']
        }
      },
      proofConfig: {
        requireCertificateImage: false,
        requirePdfProof: true,
        maxCertificateSize: 5,
        maxPdfSize: 10,
        allowMultipleCertificates: false
      },
      customQuestions: []
    };
  }
  
  /**
   * Update form field configuration for a category
   */
  static async updateFieldsForCategory(category, fieldConfig, updatedBy) {
    return await FormFieldConfig.findOneAndUpdate(
      { category },
      { 
        ...fieldConfig,
        updatedBy,
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );
  }
}

module.exports = FormFieldService;