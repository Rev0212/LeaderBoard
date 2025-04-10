import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Box, Button, CircularProgress, TextField, Alert,
  FormControl, InputLabel, Select, MenuItem, IconButton,
  Paper, Typography, Divider, Card, CardHeader, CardContent
} from '@mui/material';
import { PlusCircle, Trash2, Save, AlertTriangle, Edit } from 'lucide-react';

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

const CategoryRulesConfig = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [rulesConfig, setRulesConfig] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    // Load categories first, then configuration data
    const loadData = async () => {
      await fetchCategories();
      await fetchCurrentConfig();
    };
    
    loadData();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("admin-token");
      const response = await axios.get(
        `${VITE_BASE_URL}/admin/config/type/category`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // Store retrieved categories
        const enumCategories = response.data.data.values || [];
        console.log("Categories from enum:", enumCategories);
        setCategories(enumCategories);
        return enumCategories;
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("Could not load categories");
      return [];
    }
  };

  const fetchCurrentConfig = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("admin-token");
      const response = await axios.get(
        `${VITE_BASE_URL}/admin/config/category-rules`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success && response.data.data) {
        const configData = response.data.data.configuration || {};
        console.log("Loaded configuration data:", configData);
        setRulesConfig(configData);
        
        // Get categories from both enum and configuration
        const configCategories = Object.keys(configData);
        console.log("Categories from config:", configCategories);
        
        // Merge categories from both sources
        setCategories(prevCategories => {
          const mergedCategories = [...new Set([...prevCategories, ...configCategories])];
          console.log("Merged categories:", mergedCategories);
          return mergedCategories;
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Network error');
      toast.error('Failed to load rules configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const addCategoryRule = (category) => {
    setRulesConfig({
      ...rulesConfig,
      [category]: rulesConfig[category] || {}
    });
    setSelectedCategory(category);
  };

  const addParticipationTypeRule = (category, participationType) => {
    setRulesConfig({
      ...rulesConfig,
      [category]: {
        ...rulesConfig[category],
        [participationType]: rulesConfig[category]?.[participationType] || {}
      }
    });
  };

  const addEventScopeRule = (category, participationType, eventScope) => {
    setRulesConfig({
      ...rulesConfig,
      [category]: {
        ...rulesConfig[category],
        [participationType]: {
          ...rulesConfig[category][participationType],
          [eventScope]: rulesConfig[category]?.[participationType]?.[eventScope] || {}
        }
      }
    });
  };

  const addPositionRules = (category, participationType, eventScope, positions) => {
    setRulesConfig({
      ...rulesConfig,
      [category]: {
        ...rulesConfig[category],
        [participationType]: {
          ...rulesConfig[category][participationType],
          [eventScope]: {
            ...rulesConfig[category][participationType][eventScope],
            ...positions
          }
        }
      }
    });
  };

  const saveConfig = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    // Debug info about what's being saved
    console.log("Saving configuration with categories:", Object.keys(rulesConfig));
    Object.entries(rulesConfig).forEach(([category, config]) => {
      console.log(`Category ${category} has configuration:`, config);
    });
    
    try {
      const token = localStorage.getItem("admin-token");
      const response = await axios.post(
        `${VITE_BASE_URL}/admin/config/category-rules`,
        { 
          configuration: rulesConfig,
          notes: 'Updated via admin interface'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setSuccess('Category rules configuration updated successfully');
        toast.success('Rules configuration updated successfully');
        
        // Reload the configuration to ensure we display what was actually saved
        fetchCurrentConfig();
      } else {
        setError(response.data.message);
        toast.error(response.data.message);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update configuration';
      console.error("Error saving config:", err);
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const renderCategoryRules = () => {
    console.log("Rendering categories:", categories);
    
    if (!categories || categories.length === 0) {
      return (
        <Alert severity="warning" className="mb-4">
          No categories available. Please check your configuration.
        </Alert>
      );
    }
    
    return categories.map(category => {
      // Get configuration depth metrics to show in the UI
      const hasConfig = !!rulesConfig[category];
      let participationTypes = [];
      let configDepth = 0;
      
      try {
        participationTypes = hasConfig ? Object.keys(rulesConfig[category]) : [];
        configDepth = hasConfig && participationTypes.length > 0 ? 
          Math.max(...participationTypes.map(pt => 
            Object.keys(rulesConfig[category][pt] || {}).length
          )) : 0;
      } catch (error) {
        console.error(`Error processing category ${category}:`, error);
      }
      
      return (
        <Card 
          key={category} 
          className={`mb-4 ${hasConfig ? 'border-green-300' : 'border-gray-300'}`}
          variant="outlined"
        >
          <CardHeader
            title={
              <div className="flex items-center">
                {category}
                {hasConfig && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">
                    Configured
                  </span>
                )}
              </div>
            }
            subheader={hasConfig ? 
              `${participationTypes.join(', ')} - ${configDepth} event scopes` : 
              'Not configured yet'
            }
            action={
              <Button
                variant={rulesConfig[category] ? "outlined" : "contained"}
                size="small"
                startIcon={rulesConfig[category] ? <Edit size={16} /> : <PlusCircle size={16} />}
                onClick={() => addCategoryRule(category)}
              >
                {rulesConfig[category] ? 'Edit' : 'Configure'}
              </Button>
            }
          />
          {rulesConfig[category] && (
            <CardContent>
              <RuleBuilder 
                category={category} 
                config={rulesConfig} 
                setConfig={setRulesConfig} 
              />
            </CardContent>
          )}
        </Card>
      );
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Category-Based Points Configuration</h2>
      </div>
      
      {error && (
        <Alert severity="error" className="mb-4" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" className="mb-4" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
        <div className="flex items-start">
          <AlertTriangle size={20} className="text-blue-500 mt-1 mr-2" />
          <div>
            <p className="text-blue-800 font-medium">Important Note</p>
            <p className="text-blue-700 text-sm">
              Configure points based on multiple factors (category, participation type, event level, etc.). 
              Changes will automatically recalculate all existing events and student point totals.
            </p>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center my-8">
          <CircularProgress />
        </div>
      ) : (
        <>
          {renderCategoryRules()}
          
          <div className="flex justify-end mt-4">
            <Button
              variant="contained"
              color="primary"
              onClick={saveConfig}
              disabled={isSaving}
              startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <Save size={16} />}
            >
              {isSaving ? 'Saving...' : 'Save Rules Configuration'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

// Helper component to build the rule hierarchy
const RuleBuilder = ({ category, config, setConfig }) => {
  const participationTypes = ['Individual', 'Team'];
  const eventScopes = ['International', 'National', 'State', 'College'];
  const eventOrganizers = ['Industry Based', 'College Based']; 
  const positions = ['First', 'Second', 'Third', 'Participated'];
  
  // Updated state management - initialize with existing values or defaults
  const [selectedParticipationType, setSelectedParticipationType] = useState(() => {
    // Try to determine a default from existing config
    const categoryConfig = config[category] || {};
    return Object.keys(categoryConfig)[0] || 'Individual';
  });
  
  const [selectedEventScope, setSelectedEventScope] = useState(() => {
    // Try to determine a default from existing config
    const participationConfig = config[category]?.[selectedParticipationType] || {};
    return Object.keys(participationConfig)[0] || 'International';
  });
  
  const [selectedOrganizer, setSelectedOrganizer] = useState(() => {
    // Try to determine if there's an organizer in the config
    const scopeConfig = config[category]?.[selectedParticipationType]?.[selectedEventScope] || {};
    if (Object.keys(scopeConfig).some(key => eventOrganizers.includes(key))) {
      return Object.keys(scopeConfig).find(key => eventOrganizers.includes(key)) || '';
    }
    return '';
  });

  // Update eventScope options when participationType changes
  useEffect(() => {
    // If eventScope doesn't exist in the new participationType, reset it
    const scopesInType = Object.keys(config[category]?.[selectedParticipationType] || {});
    if (scopesInType.length > 0 && !scopesInType.includes(selectedEventScope)) {
      setSelectedEventScope(scopesInType[0]);
    }
  }, [selectedParticipationType, category, config]);

  // Update organizer when eventScope changes
  useEffect(() => {
    const scopeConfig = config[category]?.[selectedParticipationType]?.[selectedEventScope] || {};
    const organizersInScope = Object.keys(scopeConfig).filter(key => eventOrganizers.includes(key));
    
    if (organizersInScope.length > 0 && !organizersInScope.includes(selectedOrganizer)) {
      setSelectedOrganizer(organizersInScope[0]);
    } else if (organizersInScope.length === 0 && selectedOrganizer) {
      setSelectedOrganizer('');
    }
  }, [selectedEventScope, selectedParticipationType, category, config]);

  // Function to handle nested subcategories like "Industry Based"
  const getEventScopeSubcategories = (category, participationType, eventScope) => {
    const scopeConfig = config[category]?.[participationType]?.[eventScope];
    
    // If the eventScope has subcategories (like Industry Based, College Based)
    if (scopeConfig && typeof scopeConfig === 'object' && !Array.isArray(scopeConfig) && 
        !scopeConfig.hasOwnProperty('First') && !scopeConfig.hasOwnProperty('Second')) {
      return Object.keys(scopeConfig);
    }
    return null;
  };

  // Update function
  const updatePositionPoints = (category, participationType, eventScope, subcategory, position, points) => {
    console.log(`Updating ${category} -> ${participationType} -> ${eventScope} -> ${subcategory || 'N/A'} -> ${position} = ${points}`);
    
    const updatedConfig = { ...config };
    
    if (!updatedConfig[category]) updatedConfig[category] = {};
    if (!updatedConfig[category][participationType]) updatedConfig[category][participationType] = {};
    if (!updatedConfig[category][participationType][eventScope]) {
      updatedConfig[category][participationType][eventScope] = {};
    }
    
    if (subcategory) {
      if (!updatedConfig[category][participationType][eventScope][subcategory]) {
        updatedConfig[category][participationType][eventScope][subcategory] = {};
      }
      updatedConfig[category][participationType][eventScope][subcategory][position] = parseInt(points) || 0;
    } else {
      updatedConfig[category][participationType][eventScope][position] = parseInt(points) || 0;
    }
    
    setConfig(updatedConfig);
  };

  return (
    <div className="space-y-6">
      {/* Participation Type Dropdown */}
      <FormControl fullWidth variant="outlined" size="small">
        <InputLabel>Participation Type</InputLabel>
        <Select
          value={selectedParticipationType}
          onChange={(e) => setSelectedParticipationType(e.target.value)}
          label="Participation Type"
        >
          {participationTypes.map(type => (
            <MenuItem key={type} value={type}>{type}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Event Scope Dropdown */}
      <FormControl fullWidth variant="outlined" size="small">
        <InputLabel>Event Scope</InputLabel>
        <Select
          value={selectedEventScope}
          onChange={(e) => setSelectedEventScope(e.target.value)}
          label="Event Scope"
        >
          {eventScopes.map(scope => (
            <MenuItem key={scope} value={scope}>{scope}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Event Organizer Dropdown (if applicable for this category) */}
      {['Hackathon', 'Workshop', 'Conference'].includes(category) && (
        <FormControl fullWidth variant="outlined" size="small">
          <InputLabel>Event Organizer</InputLabel>
          <Select
            value={selectedOrganizer}
            onChange={(e) => setSelectedOrganizer(e.target.value)}
            label="Event Organizer"
          >
            <MenuItem value="">None</MenuItem>
            {eventOrganizers.map(org => (
              <MenuItem key={org} value={org}>{org}</MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Points Configuration Section */}
      <div className="bg-gray-50 p-4 rounded-md">
        <Typography variant="subtitle1" gutterBottom>
          Position Points
        </Typography>
        
        <div className="grid grid-cols-2 gap-4">
          {positions.map(position => (
            <div key={position} className="flex items-center">
              <Typography variant="body2" className="w-24">
                {position}:
              </Typography>
              <TextField
                size="small"
                type="number"
                variant="outlined"
                InputProps={{ inputProps: { min: 0, max: 1000 } }}
                value={
                  selectedOrganizer ? 
                    config[category]?.[selectedParticipationType]?.[selectedEventScope]?.[selectedOrganizer]?.[position] || 0 :
                    config[category]?.[selectedParticipationType]?.[selectedEventScope]?.[position] || 0
                }
                onChange={(e) => updatePositionPoints(
                  category, 
                  selectedParticipationType, 
                  selectedEventScope,
                  selectedOrganizer || null, 
                  position, 
                  e.target.value
                )}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Points Reference Guide */}
      <div className="bg-blue-50 p-3 rounded-md">
        <Typography variant="caption" className="block mb-1">
          <strong>Points Reference:</strong>
        </Typography>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <Typography variant="caption">International: 50 pts</Typography>
          <Typography variant="caption">National: 30 pts</Typography>
          <Typography variant="caption">Winner: 40 pts</Typography>
          <Typography variant="caption">Runner-up: 30 pts</Typography>
        </div>
      </div>
    </div>
  );
};

export default CategoryRulesConfig;