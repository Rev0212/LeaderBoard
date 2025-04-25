const PointsConfig = require('../models/pointsConfig.model');
const Event = require('../models/event.model');
const Student = require('../models/student.model');
const mongoose = require('mongoose');
const PointsCalculationService = require('../services/pointsCalculation.service');

/**
 * Get points configuration for a category
 */
exports.getCategoryPointsConfig = async (req, res) => {
  try {
    const { categoryName } = req.params;
    
    // Get current configuration
    const config = await PointsConfig.getCurrentConfig('categoryRules');
    
    if (!config || !config.configuration || !config.configuration[categoryName]) {
      return res.status(200).json({
        success: true,
        data: {
          category: categoryName,
          fields: {},
          exists: false
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        category: categoryName,
        fields: config.configuration[categoryName],
        exists: true
      }
    });
  } catch (error) {
    console.error('Error fetching category points config:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update points configuration for a category
 */
exports.updateCategoryPointsConfig = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { categoryName } = req.params;
    const { fields, notes } = req.body;
    
    // Validate input
    if (!fields || typeof fields !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Fields configuration must be provided as an object'
      });
    }
    
    // Get current configuration
    const currentConfig = await PointsConfig.getCurrentConfig('categoryRules');
    
    // Create new configuration
    const newConfiguration = currentConfig && currentConfig.configuration 
      ? { ...currentConfig.configuration }
      : {};
    
    // Update the category configuration
    newConfiguration[categoryName] = fields;
    
    // Create new configuration document
    const newConfig = new PointsConfig({
      configType: 'categoryRules',
      configuration: newConfiguration,
      updatedBy: req.admin._id,
      notes,
      version: currentConfig ? currentConfig.version + 1 : 1
    });
    
    await newConfig.save({ session });
    
    // Mark previous configurations as inactive
    if (currentConfig) {
      await PointsConfig.updateMany(
        { configType: 'categoryRules', _id: { $ne: newConfig._id } },
        { isActive: false },
        { session }
      );
    }
    
    // Recalculate points for events in this category
    const eventsToUpdate = await Event.find({ 
      category: categoryName,
      status: 'Approved'
    }).session(session);
    
    console.log(`Recalculating points for ${eventsToUpdate.length} events in category ${categoryName}`);
    
    for (const event of eventsToUpdate) {
      const newPoints = await PointsCalculationService.calculatePoints(event);
      await PointsCalculationService.updatePointsForEvent(event, newPoints);
    }
    
    await session.commitTransaction();
    
    res.status(200).json({
      success: true,
      data: {
        category: categoryName,
        fields: fields,
        eventsUpdated: eventsToUpdate.length
      },
      message: 'Category points configuration updated successfully'
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error updating category points config:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  } finally {
    session.endSession();
  }
};

/**
 * Analyze impact of configuration changes
 */
exports.analyzeImpact = async (req, res) => {
  try {
    const { categoryName, fields } = req.body;
    
    if (!categoryName || !fields) {
      return res.status(400).json({
        success: false,
        message: 'Category name and fields configuration are required'
      });
    }
    
    // Get events in this category
    const events = await Event.find({ 
      category: categoryName,
      status: 'Approved'
    }).populate('submittedBy', 'name registerNo');
    
    const currentConfig = await PointsConfig.getCurrentConfig('categoryRules');
    
    const impact = {
      totalEventsAffected: 0,
      totalStudentsAffected: 0,
      totalPointsChange: 0,
      studentsGainingPoints: 0,
      studentsLosingPoints: 0,
      fieldImpacts: {},
      mostImpactedStudents: []
    };
    
    // Map to track per-student impact
    const studentImpact = new Map();
    
    // Process each event
    for (const event of events) {
      // Calculate current and new points
      let newPoints = 0;
      let currentPoints = event.pointsEarned || 0;
      
      // Calculate new points using proposed fields config
      for (const field in fields) {
        const fieldValue = event[field] || 
          (event.customAnswers && event.customAnswers.get ? 
           event.customAnswers.get(field) : null);
        
        if (fieldValue && fields[field][fieldValue]) {
          newPoints += fields[field][fieldValue];
          
          // Track field-specific impacts
          if (!impact.fieldImpacts[field]) {
            impact.fieldImpacts[field] = {
              totalChange: 0,
              eventsAffected: 0
            };
          }
          
          const oldFieldPoints = currentConfig?.configuration[categoryName]?.[field]?.[fieldValue] || 0;
          const newFieldPoints = fields[field][fieldValue];
          const fieldDiff = newFieldPoints - oldFieldPoints;
          
          if (fieldDiff !== 0) {
            impact.fieldImpacts[field].totalChange += fieldDiff;
            impact.fieldImpacts[field].eventsAffected++;
          }
        }
      }
      
      const pointsDiff = newPoints - currentPoints;
      
      if (pointsDiff !== 0) {
        impact.totalEventsAffected++;
        impact.totalPointsChange += pointsDiff;
        
        // Track student impact
        const studentId = event.submittedBy._id.toString();
        const studentInfo = {
          id: studentId,
          name: event.submittedBy.name,
          registerNo: event.submittedBy.registerNo,
          pointsDiff: pointsDiff,
          eventCount: 1
        };
        
        if (studentImpact.has(studentId)) {
          const existing = studentImpact.get(studentId);
          existing.pointsDiff += pointsDiff;
          existing.eventCount++;
          studentImpact.set(studentId, existing);
        } else {
          studentImpact.set(studentId, studentInfo);
          impact.totalStudentsAffected++;
        }
        
        if (pointsDiff > 0) {
          impact.studentsGainingPoints++;
        } else {
          impact.studentsLosingPoints++;
        }
      }
    }
    
    // Get most impacted students
    impact.mostImpactedStudents = Array.from(studentImpact.values())
      .sort((a, b) => Math.abs(b.pointsDiff) - Math.abs(a.pointsDiff))
      .slice(0, 10);
    
    res.status(200).json({
      success: true,
      data: impact
    });
  } catch (error) {
    console.error('Error analyzing configuration impact:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};