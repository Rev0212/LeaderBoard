const PointsConfig = require('../models/pointsConfig.model');
const CategoryRulesConfig = require('../models/categoryRulesConfig.model');

class PointsCalculationService {
  /**
   * Calculate points for an event
   * @param {Object} event - Event details
   * @returns {Number} - Calculated points
   */
  static async calculatePoints(event) {
    try {
      // Get the category rules
      const categoryRules = await CategoryRulesConfig.findOne().lean();
      if (!categoryRules || !categoryRules.configuration) {
        return 0;
      }

      // Find rules for this category
      const category = event.category;
      const rules = categoryRules.configuration[category];
      if (!rules) {
        return 0;
      }

      // Calculate based on category and attributes
      let points = 0;
      
      // Use the rules configuration to determine points
      switch(category) {
        case 'Hackathon':
          points = this.calculateHackathonPoints(event, rules);
          break;
        case 'Coding':
          points = this.calculateCodingPoints(event, rules);
          break;
        case 'Open Source':
          points = this.calculateOpenSourcePoints(event, rules);
          break;
        // Add other categories as needed
        default:
          // Try to use hierarchical rules if defined
          if (this.hasHierarchicalRules(rules, event)) {
            points = this.calculateHierarchicalPoints(event, rules);
          }
      }

      return points;
    } catch (error) {
      console.error('Error calculating points:', error);
      return 0;
    }
  }

  /**
   * Preview points calculation for display only
   * This is safe to expose to students as it's only for preview purposes
   * and doesn't affect the actual points calculation during verification
   */
  static async previewCalculation(category, formData, customAnswers) {
    try {
      // Get the category rules
      const categoryRules = await CategoryRulesConfig.findOne().lean();
      if (!categoryRules || !categoryRules.configuration) {
        return { totalPoints: 0, breakdown: {}, scoringFields: [] };
      }
      
      // Initialize result
      const result = {
        totalPoints: 0,
        breakdown: {},
        scoringFields: []
      };
      
      // Extract rules for this category
      const rules = categoryRules.configuration[category];
      if (!rules) {
        return result;
      }
      
      // Track which fields affect scoring
      const scoringFields = new Set();
      
      // Calculate points based on category-specific fields
      switch (category) {
        case 'Hackathon': {
          // Level points
          if (formData.eventScope) {
            scoringFields.add('eventScope');
            let levelPoints = 0;
            
            switch (formData.eventScope) {
              case 'Intra-College':
                levelPoints = 10;
                break;
              case 'Inter-College':
                levelPoints = 20;
                break;
              case 'National':
                levelPoints = 30;
                break;
              case 'International':
                levelPoints = 50;
                break;
            }
            
            result.breakdown['Event Level'] = levelPoints;
            result.totalPoints += levelPoints;
          }
          
          // Organizer points
          if (formData.eventOrganizer) {
            scoringFields.add('eventOrganizer');
            let organizerPoints = 0;
            
            switch (formData.eventOrganizer) {
              case 'Industry':
                organizerPoints = 15;
                break;
              case 'Academic Institution':
                organizerPoints = 5;
                break;
            }
            
            result.breakdown['Organizer Type'] = organizerPoints;
            result.totalPoints += organizerPoints;
          }
          
          // Position points
          if (formData.positionSecured) {
            scoringFields.add('positionSecured');
            let positionPoints = 0;
            
            switch (formData.positionSecured) {
              case 'First':
                positionPoints = 40;
                break;
              case 'Second':
                positionPoints = 30;
                break;
              case 'Third':
                positionPoints = 20;
                break;
              case 'Finalist':
                positionPoints = 10;
                break;
              case 'Participated':
                positionPoints = 5;
                break;
            }
            
            result.breakdown['Position'] = positionPoints;
            result.totalPoints += positionPoints;
          }
          
          // Check for solo participation
          if (formData.participationType) {
            scoringFields.add('participationType');
            let participationPoints = 0;
            
            if (formData.participationType === 'Individual') {
              participationPoints = 15;
              
              // Check for solo bonus (if won)
              if (formData.positionSecured === 'First' || 
                  formData.positionSecured === 'Second' || 
                  formData.positionSecured === 'Third') {
                result.breakdown['Solo Bonus'] = 10;
                result.totalPoints += 10;
              }
            }
            
            result.breakdown['Participation Mode'] = participationPoints;
            result.totalPoints += participationPoints;
          }
          
          break;
        }
        
        // Add other categories as needed...
      }
      
      // Convert scoring fields set to array
      result.scoringFields = Array.from(scoringFields);
      
      return result;
    } catch (error) {
      console.error('Error calculating points preview:', error);
      return { totalPoints: 0, breakdown: {}, scoringFields: [] };
    }
  }

  // Other helper methods for specific category calculations...
}

module.exports = PointsCalculationService;