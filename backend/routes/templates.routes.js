const express = require('express');
const router = express.Router();
const { authAdmin } = require('../middlewares/auth.middlewares');
const Template = require('../models/template.model'); // You would need to create this model

// Get all templates for a category
router.get('/templates/:category', authAdmin, async (req, res) => {
  try {
    const { category } = req.params;
    const templates = await Template.find({ category });
    
    res.status(200).json({
      success: true,
      templates: templates.reduce((acc, template) => {
        acc[template.name] = template.config;
        return acc;
      }, {})
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Save a new template
router.post('/templates/:category', authAdmin, async (req, res) => {
  try {
    const { category } = req.params;
    const { name, config } = req.body;
    
    // Check if template already exists
    let template = await Template.findOne({ category, name });
    
    if (template) {
      // Update existing template
      template.config = config;
      template.updatedBy = req.admin._id;
      await template.save();
    } else {
      // Create new template
      template = new Template({
        category,
        name,
        config,
        createdBy: req.admin._id,
        updatedBy: req.admin._id
      });
      await template.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'Template saved successfully',
      template
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete a template
router.delete('/templates/:category/:name', authAdmin, async (req, res) => {
  try {
    const { category, name } = req.params;
    await Template.deleteOne({ category, name });
    
    res.status(200).json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get default templates for all categories
router.get('/default-templates', authAdmin, async (req, res) => {
  try {
    // Fetch all templates from database grouped by category
    const templates = await Template.find({});
    
    // Transform into needed format
    const groupedTemplates = templates.reduce((acc, template) => {
      if (!acc[template.category]) {
        acc[template.category] = {};
      }
      acc[template.category][template.name] = template.config;
      return acc;
    }, {});
    
    res.status(200).json({
      success: true,
      templates: groupedTemplates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;