const FormFieldConfig = require('../models/formFieldConfig.model');
const Template = require('../models/template.model');

class FormFieldService {
  /**
   * Get form fields configuration for a category
   */
  static async getFieldsForCategory(category) {
    try {
      // Normalize the category to lowercase for consistent handling
      const normalizedCategory = category.toLowerCase();
      console.log(`Looking for form fields for normalized category: ${normalizedCategory}`);
      
      // First check if there's a custom form field config (case insensitive)
      const config = await FormFieldConfig.findOne({ 
        category: new RegExp(`^${normalizedCategory}$`, 'i')
      }).lean();
      
      if (config) {
        console.log(`Found form field config for category: ${normalizedCategory}`);
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
      
      // If no config found, check for template
      console.log(`No form field config found, checking templates for: ${normalizedCategory}`);
      
      // Better case-insensitive search 
      const allTemplates = await Template.find({}).lean();
      console.log(`Found ${allTemplates.length} templates in total`);
      
      // Find template with matching category (case-insensitive)
      const template = allTemplates.find(t => 
        t.category && t.category.toLowerCase() === normalizedCategory
      );
      
      if (template && template.config) {
        console.log(`Found template for ${normalizedCategory}: ${template.name}`);
        
        // Extract template config
        const templateConfig = {
          requiredFields: template.config.requiredFields || [],
          optionalFields: template.config.optionalFields || [],
          conditionalFields: template.config.conditionalFields || {},
          proofConfig: template.config.proofConfig || {
            requireCertificateImage: false,
            requirePdfProof: true,
            maxCertificateSize: 5,
            maxPdfSize: 10,
            allowMultipleCertificates: false
          },
          customQuestions: template.config.customQuestions || []
        };
        
        // Save to FormFieldConfig for future use
        console.log(`Saving template to FormFieldConfig for future use`);
        try {
          await this.updateFieldsForCategory(
            normalizedCategory, 
            templateConfig, 
            template.updatedBy || template.createdBy
          );
        } catch (err) {
          console.error("Error saving to FormFieldConfig:", err);
        }
        
        return templateConfig;
      }
      
      console.log(`No template found for category: ${normalizedCategory}`);
      // If no config or template found, return default fields
      return this.getDefaultFields();
    } catch (error) {
      console.error(`Error getting fields for category ${category}:`, error);
      return this.getDefaultFields();
    }
  }
  
  static getDefaultFields() {
    return {
      requiredFields: ['eventName', 'date', 'category', 'positionSecured'],
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