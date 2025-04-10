const PointsConfig = require('../models/pointsConfig.model');

class PointsCalculationService {
  /**
   * Calculate points for an event based on multiple factors
   */
  static async calculatePoints(event) {
    // Try to use category rules first
    const categoryConfig = await PointsConfig.getCurrentConfig('categoryRules');
    
    if (categoryConfig) {
      const points = await this.calculateFromCategoryRules(event, categoryConfig.configuration);
      if (points !== null) {
        return points;
      }
    }
    
    // If category rules don't apply, provide a default value instead of using position rules
    console.log(`No category rule found for event ${event._id}, using default points`);
    return 5; // default minimal points
  }
  
  /**
   * Calculate points using hierarchical category rules
   */
  static async calculateFromCategoryRules(event, rules) {
    if (!rules || !rules[event.category]) {
      // If no specific rule for this category, try to use a default rule
      if (rules && rules['Others']) {
        console.log(`No specific rule for ${event.category}, using 'Others' rules`);
        return this.calculateFromCategoryRules({...event, category: 'Others'}, rules);
      }
      return null;
    }
    
    let categoryRules = rules[event.category];
    
    // Navigate through rule hierarchy based on event properties
    if (event.participationType && categoryRules[event.participationType]) {
      categoryRules = categoryRules[event.participationType];
      
      if (event.eventScope && categoryRules[event.eventScope]) {
        categoryRules = categoryRules[event.eventScope];
        
        if (event.eventOrganizer && categoryRules[event.eventOrganizer]) {
          categoryRules = categoryRules[event.eventOrganizer];
        }
      }
    }
    
    // If we have a direct points value
    if (typeof categoryRules === 'number') {
      return categoryRules;
    }
    
    // If we have position-based points within the category
    if (event.positionSecured && categoryRules[event.positionSecured]) {
      return categoryRules[event.positionSecured];
    }
    
    return null;
  }
  
  /**
   * Calculate points using legacy position-based rules
   */
  static async calculateFromPositionRules(event) {
    const positionConfig = await PointsConfig.getCurrentConfig('positionPoints');
    
    if (!positionConfig || !positionConfig.configuration) {
      return 0;
    }
    
    return positionConfig.configuration[event.positionSecured] || 0;
  }
}

module.exports = PointsCalculationService;