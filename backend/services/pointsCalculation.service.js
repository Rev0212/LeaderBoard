const PointsConfig = require('../models/pointsConfig.model');
const mongoose = require('mongoose');
const Student = require('../models/student.model');

class PointsCalculationService {
  /**
   * Calculate points for an event based on category-specific rules
   * This fetches the configuration from the database
   * @param {Object} event - The event document
   * @returns {Number} - Total points calculated
   */
  static async calculatePoints(event) {
    try {
      // Get category rules configuration
      const categoryConfig = await PointsConfig.getCurrentConfig('categoryRules');
      
      // If no config exists, return 0 points (no default values)
      if (!categoryConfig || !categoryConfig.configuration) {
        console.log('No category rules configuration found');
        return 0;
      }
      
      return this.calculatePointsWithConfig(event, categoryConfig.configuration);
    } catch (error) {
      console.error('Error calculating points:', error);
      return 0; // Return 0 on error instead of falling back to defaults
    }
  }
  
  /**
   * Calculate points using a provided configuration
   * This avoids transaction visibility issues
   * @param {Object} event - The event document
   * @param {Object} configuration - The points configuration
   * @returns {Number} - Total points calculated
   */
  static async calculatePointsWithConfig(event, configuration) {
    try {
      const category = event.category;
      
      // If no rules for this category, return 0 points
      if (!configuration[category]) {
        console.log(`No rules found for category: ${category}`);
        return 0;
      }
      
      // Debug log
      console.log(`Found points configuration for ${category}:`, JSON.stringify(configuration[category]));
      console.log(`Event custom answers:`, Array.from(event.customAnswers ? event.customAnswers.entries() : []));
      
      // Calculate total points based on event attributes
      let totalPoints = 0;
      
      // Process each field in the category configuration
      for (const field in configuration[category]) {
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
        
        // Check if the field value has a defined points value in the configuration
        if (fieldValue && configuration[category][field][fieldValue]) {
          const points = configuration[category][field][fieldValue];
          totalPoints += points;
          console.log(`Added ${points} points for ${field}=${fieldValue}`);
        }
      }
      
      console.log(`Total points calculated for event ${event._id}: ${totalPoints}`);
      return totalPoints;
    } catch (error) {
      console.error('Error calculating points with config:', error);
      return 0; // Return 0 on error instead of falling back to defaults
    }
  }
  
  /**
   * Update event points and student total points
   * @param {Object} event - The event document
   * @param {Number} newPoints - Newly calculated points
   * @param {mongoose.ClientSession} [session] - Optional MongoDB session for transactions
   * @returns {Boolean} - Success status
   */
  static async updatePointsForEvent(event, newPoints, session = null) {
    // If no session is provided, start a new one
    const useExistingSession = !!session;
    if (!session) {
      session = await mongoose.startSession();
      session.startTransaction();
    }
    
    try {
      const oldPoints = event.pointsEarned || 0;
      const pointsDiff = newPoints - oldPoints;
      
      // Update event points
      event.pointsEarned = newPoints;
      await event.save({ session });
      
      // Update student total points if there's a difference
      if (pointsDiff !== 0) {
        await Student.findByIdAndUpdate(
          event.submittedBy,
          { $inc: { totalPoints: pointsDiff } },
          { session }
        );
        
        console.log(`Updated student ${event.submittedBy} points by ${pointsDiff}`);
      }
      
      // Only commit if we started the transaction here
      if (!useExistingSession) {
        await session.commitTransaction();
      }
      return true;
    } catch (error) {
      // Only abort if we started the transaction here
      if (!useExistingSession) {
        await session.abortTransaction();
      }
      console.error('Error updating points:', error);
      return false;
    } finally {
      // Only end the session if we started it here
      if (!useExistingSession) {
        session.endSession();
      }
    }
  }
}

module.exports = PointsCalculationService;