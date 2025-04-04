const facultyReportService = require('../services/facultyReport.service');

class FacultyReportController {
  /**
   * Get class performance overview for faculty's assigned class
   */
  static async getClassOverview(req, res, next) {
    try {
      console.log('Getting class overview for faculty:', req.teacher.name);
      
      const overview = await facultyReportService.getClassOverview(req.teacher);
      
      res.status(200).json({ 
        success: true, 
        data: overview 
      });
    } catch (error) {
      console.error('Error in getClassOverview controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get class overview'
      });
    }
  }

  /**
   * Get department ranking for faculty's class
   */
  static async getDepartmentRanking(req, res, next) {
    try {
      console.log('Getting department ranking for faculty:', req.teacher.name);
      
      const ranking = await facultyReportService.getDepartmentRanking(req.teacher);
      
      res.status(200).json({ 
        success: true, 
        data: ranking 
      });
    } catch (error) {
      console.error('Error in getDepartmentRanking controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get department ranking'
      });
    }
  }

  /**
   * Get student analysis for faculty's class
   */
  static async getStudentAnalysis(req, res, next) {
    try {
      console.log('Getting student analysis for faculty:', req.teacher.name);
      
      const analysis = await facultyReportService.getStudentAnalysis(req.teacher);
      
      res.status(200).json({ 
        success: true, 
        data: analysis 
      });
    } catch (error) {
      console.error('Error in getStudentAnalysis controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get student analysis'
      });
    }
  }

  /**
   * Get category analysis for faculty's class
   */
  static async getCategoryAnalysis(req, res, next) {
    try {
      console.log('Getting category analysis for faculty:', req.teacher.name);
      
      const analysis = await facultyReportService.getCategoryAnalysis(req.teacher);
      
      res.status(200).json({ 
        success: true, 
        data: analysis 
      });
    } catch (error) {
      console.error('Error in getCategoryAnalysis controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get category analysis'
      });
    }
  }

  /**
   * Get participation trends for faculty's class
   */
  static async getParticipationTrends(req, res, next) {
    try {
      console.log('Getting participation trends for faculty:', req.teacher.name);
      
      const timeframe = req.query.timeframe || 'monthly'; // Default to monthly
      const months = parseInt(req.query.months) || 6; // Default to 6 months
      
      const trends = await facultyReportService.getParticipationTrends(
        req.teacher,
        timeframe,
        months
      );
      
      res.status(200).json({ 
        success: true, 
        data: trends 
      });
    } catch (error) {
      console.error('Error in getParticipationTrends controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get participation trends'
      });
    }
  }

  /**
   * Get engagement opportunities for faculty's class
   */
  static async getEngagementOpportunities(req, res, next) {
    try {
      console.log('Getting engagement opportunities for faculty:', req.teacher.name);
      
      const opportunities = await facultyReportService.getEngagementOpportunities(req.teacher);
      
      res.status(200).json({ 
        success: true, 
        data: opportunities 
      });
    } catch (error) {
      console.error('Error in getEngagementOpportunities controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get engagement opportunities'
      });
    }
  }
}

module.exports = FacultyReportController;