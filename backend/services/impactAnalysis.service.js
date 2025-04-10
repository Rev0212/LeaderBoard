const Event = require('../models/event.model');
const Student = require('../models/student.model');

exports.analyzePointsChange = async (newConfiguration) => {
  try {
    const impacts = {
      totalEventsAffected: 0,
      totalStudentsAffected: 0,
      totalPointsChange: 0,
      studentsGainingPoints: 0,
      studentsLosingPoints: 0,
      positionImpacts: {},
      mostImpactedStudents: []
    };
    
    // Get current points from existing events
    const positionCounts = await Event.aggregate([
      { $match: { status: 'Approved' } },
      { 
        $group: { 
          _id: '$positionSecured',
          count: { $sum: 1 },
          totalCurrentPoints: { $sum: '$pointsEarned' }
        }
      }
    ]);
    
    // Calculate impacts per position
    for (const position of positionCounts) {
      const positionName = position._id;
      const eventCount = position.count;
      const currentTotalPoints = position.totalCurrentPoints;
      
      // Skip positions not in new config
      if (!newConfiguration[positionName]) continue;
      
      const newPointValue = parseInt(newConfiguration[positionName]);
      const oldAvgPointValue = eventCount > 0 ? currentTotalPoints / eventCount : 0;
      const pointChangePerEvent = newPointValue - oldAvgPointValue;
      const totalPointChange = pointChangePerEvent * eventCount;
      
      impacts.totalEventsAffected += eventCount;
      impacts.totalPointsChange += totalPointChange;
      impacts.positionImpacts[positionName] = {
        eventCount,
        oldAvgPointValue: Math.round(oldAvgPointValue * 100) / 100,
        newPointValue,
        pointChangePerEvent: Math.round(pointChangePerEvent * 100) / 100,
        totalPointChange: Math.round(totalPointChange * 100) / 100
      };
    }
    
    // Calculate student-level impacts for most significant changes
    const studentImpacts = [];
    
    // For each position with changes
    for (const [position, newValue] of Object.entries(newConfiguration)) {
      // Find students with events in this position
      const students = await Event.aggregate([
        { $match: { status: 'Approved', positionSecured: position } },
        { 
          $group: { 
            _id: '$submittedBy', 
            eventCount: { $sum: 1 },
            currentPoints: { $sum: '$pointsEarned' }
          } 
        },
        { $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: '_id',
          as: 'studentInfo'
        }},
        { $unwind: '$studentInfo' },
        { 
          $project: { 
            studentId: '$_id',
            name: '$studentInfo.name',
            registerNo: '$studentInfo.registerNo',
            eventCount: 1,
            currentPoints: 1,
            newPoints: { $multiply: ['$eventCount', parseInt(newValue)] },
            pointsDifference: { $subtract: [{ $multiply: ['$eventCount', parseInt(newValue)] }, '$currentPoints'] }
          } 
        }
      ]);
      
      // Add to student impacts array
      studentImpacts.push(...students);
    }
    
    // Calculate total students affected
    impacts.totalStudentsAffected = studentImpacts.length;
    impacts.studentsGainingPoints = studentImpacts.filter(s => s.pointsDifference > 0).length;
    impacts.studentsLosingPoints = studentImpacts.filter(s => s.pointsDifference < 0).length;
    
    // Get most impacted students (top 10 gain, top 10 loss)
    const topGainers = studentImpacts
      .filter(s => s.pointsDifference > 0)
      .sort((a, b) => b.pointsDifference - a.pointsDifference)
      .slice(0, 10);
    
    const topLosers = studentImpacts
      .filter(s => s.pointsDifference < 0)
      .sort((a, b) => a.pointsDifference - b.pointsDifference)
      .slice(0, 10);
    
    impacts.mostImpactedStudents = [...topGainers, ...topLosers];
    
    return impacts;
  } catch (error) {
    console.error('Error analyzing points change impacts:', error);
    throw error;
  }
};