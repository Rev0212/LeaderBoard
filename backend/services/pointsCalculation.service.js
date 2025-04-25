const PointsConfig = require('../models/pointsConfig.model');
const mongoose = require('mongoose');

class PointsCalculationService {
  /**
   * Calculate points for an event based on category-specific rules
   * @param {Object} event - The event document
   * @returns {Number} - Total points calculated
   */
  static async calculatePoints(event) {
    try {
      // Get category rules configuration
      const categoryConfig = await PointsConfig.getCurrentConfig('categoryRules');
      
      // If no config exists, return 0 points
      if (!categoryConfig || !categoryConfig.configuration) {
        console.log('No category rules configuration found');
        return 0;
      }
      
      const category = event.category;
      const config = categoryConfig.configuration;
      
      // If no rules for this category, return 0 points
      if (!config[category]) {
        console.log(`No rules found for category: ${category}`);
        return 0;
      }
      
      // Debug log
      console.log(`Found points configuration for ${category}:`, JSON.stringify(config[category]));
      console.log(`Event custom answers:`, Array.from(event.customAnswers.entries()));
      
      // Calculate total points based on event attributes
      let totalPoints = 0;
      
      // Process each field in the category configuration
      for (const field in config[category]) {
        // First try standard field
        let fieldValue = event[field];
        
        // If not found in standard fields, check customAnswers
        if (!fieldValue && event.customAnswers && event.customAnswers instanceof Map) {
          // Try exact field name
          if (event.customAnswers.has(field)) {
            fieldValue = event.customAnswers.get(field);
          } 
          // Try variations of field name (lowercase, underscore replaced with spaces, etc)
          else {
            // Log all custom answer keys to help with debugging
            console.log(`Looking for field '${field}' in custom answers:`, 
                        Array.from(event.customAnswers.keys()));
            
            // Convert the field name to lowercase for case-insensitive comparison
            const normalizedField = field.toLowerCase().replace(/\s+/g, '_');
            
            // Find a matching key in customAnswers using normalized comparison
            for (const [key, value] of event.customAnswers.entries()) {
              const normalizedKey = key.toLowerCase().replace(/\s+/g, '_');
              if (normalizedKey.includes(normalizedField) || 
                  normalizedField.includes(normalizedKey)) {
                fieldValue = value;
                console.log(`Found matching field: ${key} = ${value}`);
                break;
              }
            }
          }
        }
        
        // If we found a value, check if it exists in the configuration
        if (fieldValue && config[category][field][fieldValue]) {
          const points = config[category][field][fieldValue];
          totalPoints += points;
          console.log(`Added ${points} points for ${field}=${fieldValue}`);
        }
      }
      
      console.log(`Total points calculated for event ${event._id}: ${totalPoints}`);
      return totalPoints;
    } catch (error) {
      console.error('Error calculating points:', error);
      return 0;
    }
  }
  
  /**
   * Update event points and student total points
   * @param {Object} event - The event document
   * @param {Number} newPoints - Newly calculated points
   */
  static async updatePointsForEvent(event, newPoints) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const oldPoints = event.pointsEarned || 0;
      const pointsDiff = newPoints - oldPoints;
      
      // Update event points
      event.pointsEarned = newPoints;
      await event.save({ session });
      
      // Update student total points if there's a difference
      if (pointsDiff !== 0) {
        await mongoose.model('Student').findByIdAndUpdate(
          event.submittedBy,
          { $inc: { totalPoints: pointsDiff } },
          { session }
        );
      }
      
      await session.commitTransaction();
      return true;
    } catch (error) {
      await session.abortTransaction();
      console.error('Error updating points:', error);
      return false;
    } finally {
      session.endSession();
    }
  }
}

module.exports = PointsCalculationService;