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
      // Get the category rules from active configuration
      const categoryRules = await PointsConfig.getCurrentConfig('categoryRules');
      if (!categoryRules || !categoryRules.configuration) {
        console.log('No active category rules configuration found');
        return 0;
      }

      // Find rules for this category
      const category = event.category;
      const rules = categoryRules.configuration[category];
      if (!rules) {
        console.log(`No rules found for category: ${category}`);
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

      console.log(`Calculated ${points} points for event ${event._id} (${category})`);
      return points;
    } catch (error) {
      console.error('Error calculating points:', error);
      return 0;
    }
  }

  /**
   * Helper method to extract event values, checking both direct properties and maps
   * @param {Object} event - The event object
   * @param {String} field - The field name to extract
   * @returns {*} - The field value
   */
  static getEventValue(event, field) {
    // Check direct properties first
    if (event[field] !== undefined) {
      return event[field];
    }
    
    // Then check customAnswers Map
    if (event.customAnswers && event.customAnswers.get && event.customAnswers.get(field) !== undefined) {
      return event.customAnswers.get(field);
    }
    
    // Check dynamicFields Map
    if (event.dynamicFields && event.dynamicFields.get && event.dynamicFields.get(field) !== undefined) {
      return event.dynamicFields.get(field);
    }
    
    // Check for custom answer prefixed fields
    const customAnswerKey = `customAnswer_${field}`;
    if (event[customAnswerKey] !== undefined) {
      return event[customAnswerKey];
    }
    
    return undefined;
  }

  /**
   * Check if hierarchical rules are defined for this event category
   * @param {Object} rules - Category rules
   * @param {Object} event - Event details
   * @returns {Boolean} - Whether hierarchical rules exist
   */
  static hasHierarchicalRules(rules, event) {
    // Check if rules has a structure like Individual/Team → Event Scope → Positions
    const participationType = this.getEventValue(event, 'participationType');
    if (participationType && rules[participationType]) {
      return true;
    }
    
    // If it has any nested object structure, consider it hierarchical
    return Object.values(rules).some(value => 
      typeof value === 'object' && !Array.isArray(value)
    );
  }

  /**
   * Calculate points using hierarchical rules
   * @param {Object} event - Event details
   * @param {Object} rules - Hierarchical rules structure
   * @returns {Number} - Calculated points
   */
  static calculateHierarchicalPoints(event, rules) {
    try {
      // Extract key attributes from event
      const participationType = this.getEventValue(event, 'participationType') || 'Individual';
      const eventScope = this.getEventValue(event, 'eventScope') || 'National';
      const position = this.getEventValue(event, 'positionSecured') || 'Participated';
      const eventOrganizer = this.getEventValue(event, 'eventOrganizer');
      
      console.log(`Calculating hierarchical points for: ${participationType} - ${eventScope} - ${eventOrganizer || 'N/A'} - ${position}`);
      
      // Navigate the rules hierarchy
      let typeRules = rules[participationType];
      if (!typeRules) {
        console.log(`No rules for participation type: ${participationType}`);
        return 0;
      }
      
      let scopeRules = typeRules[eventScope];
      if (!scopeRules) {
        console.log(`No rules for event scope: ${eventScope}`);
        return 0;
      }
      
      // Check if we have organizer-specific rules
      if (eventOrganizer && scopeRules[eventOrganizer]) {
        let organizerRules = scopeRules[eventOrganizer];
        if (organizerRules[position] !== undefined) {
          return organizerRules[position];
        }
      }
      
      // If no organizer-specific rules or if organizer not specified, check direct position rules
      if (scopeRules[position] !== undefined) {
        return scopeRules[position];
      }
      
      console.log('No matching position rules found');
      return 0;
    } catch (error) {
      console.error('Error in hierarchical points calculation:', error);
      return 0;
    }
  }
  
  /**
   * Calculate points for Hackathon events
   * @param {Object} event - Hackathon event details
   * @param {Object} rules - Hackathon rules
   * @returns {Number} - Points earned
   */
  static calculateHackathonPoints(event, rules) {
    // For Hackathon, we'll use the hierarchical rules
    return this.calculateHierarchicalPoints(event, rules);
  }
  
  /**
   * Calculate points for Coding Competition events
   * @param {Object} event - Coding event details
   * @param {Object} rules - Coding rules
   * @returns {Number} - Points earned
   */
  static calculateCodingPoints(event, rules) {
    try {
      // Coding competitions might have additional factors like platform, percentile, etc.
      const participationType = this.getEventValue(event, 'participationType') || 'Individual';
      const eventScope = this.getEventValue(event, 'eventScope') || 'National';
      const position = this.getEventValue(event, 'positionSecured') || 'Participated';
      const codingPlatform = this.getEventValue(event, 'coding_platform') || 
                             this.getEventValue(event, 'platform');
      const percentile = this.getEventValue(event, 'percentile_rank') ||
                         this.getEventValue(event, 'resultPercentile');
      
      console.log(`Calculating coding points: ${participationType} - ${eventScope} - ${position} - Platform: ${codingPlatform} - Percentile: ${percentile}`);
      
      // Start with hierarchical base points
      let points = this.calculateHierarchicalPoints(event, rules);
      
      // Add any platform-specific bonuses if defined in rules
      if (codingPlatform && rules.Platform && rules.Platform[codingPlatform]) {
        points += rules.Platform[codingPlatform];
      }
      
      // Add percentile-based bonuses if defined
      if (percentile && rules['Result Percentile'] && rules['Result Percentile'][percentile]) {
        points += rules['Result Percentile'][percentile];
      }
      
      return points;
    } catch (error) {
      console.error('Error calculating coding points:', error);
      return this.calculateHierarchicalPoints(event, rules); // Fallback to hierarchical
    }
  }
  
  /**
   * Calculate points for Open Source Contribution events
   * @param {Object} event - Open Source event details
   * @param {Object} rules - Open Source rules
   * @returns {Number} - Points earned
   */
  static calculateOpenSourcePoints(event, rules) {
    try {
      // Open source has factors like repo popularity, PR status, etc.
      let points = 0;
      
      // Check repo popularity
      const repoForks = this.getEventValue(event, 'repo_forks');
      if (repoForks && rules['Repo Forks'] && rules['Repo Forks'][repoForks]) {
        points += rules['Repo Forks'][repoForks];
      }
      
      // Check PR status
      const prStatus = this.getEventValue(event, 'pr_status');
      if (prStatus && rules['PR Status'] && rules['PR Status'][prStatus]) {
        points += rules['PR Status'][prStatus];
      }
      
      // Check contribution type
      const contributionType = this.getEventValue(event, 'contribution_type');
      if (contributionType && rules['Contribution Type'] && rules['Contribution Type'][contributionType]) {
        points += rules['Contribution Type'][contributionType];
      }
      
      return points;
    } catch (error) {
      console.error('Error calculating open source points:', error);
      return 0;
    }
  }

}

module.exports = PointsCalculationService;