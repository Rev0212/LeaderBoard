import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Box, Button, CircularProgress, TextField, Alert,
  FormControl, InputLabel, Select, MenuItem, Typography,
  Card, CardContent, CardHeader, Divider, Dialog, DialogTitle,
  DialogContent, DialogActions, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Accordion,
  AccordionSummary, AccordionDetails
} from '@mui/material';
import { Save, AlertTriangle, TrendingUp } from 'lucide-react';
import { ExpandMore } from '@mui/icons-material';

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

const CategoryPointsConfig = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [fieldsConfig, setFieldsConfig] = useState({});
  const [originalConfig, setOriginalConfig] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showImpactDialog, setShowImpactDialog] = useState(false);
  const [impactData, setImpactData] = useState(null);
  const [impactLoading, setImpactLoading] = useState(false);
  
  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);
  
  // Fetch category config when selected category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchCategoryConfig(selectedCategory);
    }
  }, [selectedCategory]);
  
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("admin-token");
      const response = await axios.get(
        `${VITE_BASE_URL}/admin/config/type/category`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setCategories(response.data.data.values || []);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("Could not load categories");
    }
  };
  
  const fetchCategoryConfig = async (category) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("admin-token");
      const response = await axios.get(
        `${VITE_BASE_URL}/admin/config/points/category/${category}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        const config = response.data.data.fields || {};
        setOriginalConfig(JSON.parse(JSON.stringify(config))); // Deep copy
        setFieldsConfig(config);
      }
    } catch (error) {
      setError("Failed to load category configuration");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };
  
  const handlePointsChange = (field, option, value) => {
    const numValue = parseInt(value) || 0;
    
    setFieldsConfig(prev => {
      const newConfig = {...prev};
      
      if (!newConfig[field]) {
        newConfig[field] = {};
      }
      
      newConfig[field][option] = numValue;
      return newConfig;
    });
  };
  
  const handleAddField = () => {
    const fieldName = prompt("Enter field name (e.g., Level, Organizer):");
    if (!fieldName) return;
    
    setFieldsConfig(prev => {
      return {
        ...prev,
        [fieldName]: { }
      };
    });
  };
  
  const handleAddOption = (field) => {
    const option = prompt(`Enter option for ${field} (e.g., International, Industry):`);
    if (!option) return;
    
    setFieldsConfig(prev => {
      const newConfig = {...prev};
      
      if (!newConfig[field]) {
        newConfig[field] = {};
      }
      
      newConfig[field][option] = 0;
      return newConfig;
    });
  };
  
  const handleFieldRemove = (field) => {
    if (!confirm(`Are you sure you want to remove the "${field}" field and all its options?`)) {
      return;
    }
    
    setFieldsConfig(prev => {
      const newConfig = {...prev};
      delete newConfig[field];
      return newConfig;
    });
  };
  
  const handleOptionRemove = (field, option) => {
    if (!confirm(`Are you sure you want to remove the "${option}" option from ${field}?`)) {
      return;
    }
    
    setFieldsConfig(prev => {
      const newConfig = {...prev};
      
      if (newConfig[field]) {
        const fieldConfig = {...newConfig[field]};
        delete fieldConfig[option];
        newConfig[field] = fieldConfig;
      }
      
      return newConfig;
    });
  };
  
  const hasChanges = () => {
    return JSON.stringify(originalConfig) !== JSON.stringify(fieldsConfig);
  };
  
  const previewImpact = async () => {
    setImpactLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("admin-token");
      const response = await axios.post(
        `${VITE_BASE_URL}/admin/config/points/impact-analysis`,
        {
          categoryName: selectedCategory,
          fields: fieldsConfig
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setImpactData(response.data.data);
        setShowImpactDialog(true);
      }
    } catch (error) {
      setError("Failed to analyze impact");
      console.error(error);
    } finally {
      setImpactLoading(false);
    }
  };
  
  const saveChanges = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const token = localStorage.getItem("admin-token");
      const response = await axios.put(
        `${VITE_BASE_URL}/admin/config/points/category/${selectedCategory}`,
        {
          fields: fieldsConfig,
          notes: `Updated ${selectedCategory} points configuration`
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setOriginalConfig(JSON.parse(JSON.stringify(fieldsConfig))); // Deep copy
        setSuccess(`${selectedCategory} points configuration updated successfully`);
        toast.success("Configuration saved successfully");
        setShowImpactDialog(false);
      }
    } catch (error) {
      setError("Failed to save configuration: " + (error.response?.data?.message || error.message));
      toast.error("Failed to save configuration");
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Category Points Configuration</h2>
        <div>
          <Button
            variant="outlined"
            color="primary"
            onClick={previewImpact}
            disabled={!selectedCategory || isLoading || isSaving || !hasChanges()}
            className="mr-2"
            startIcon={<TrendingUp size={16} />}
          >
            Preview Impact
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={saveChanges}
            disabled={!selectedCategory || isLoading || isSaving || !hasChanges()}
            startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <Save size={16} />}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
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
              Changes to points configuration will automatically recalculate points for all existing events in this category.
              Use the Preview Impact button to see how your changes will affect students and events.
            </p>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <FormControl fullWidth>
          <InputLabel id="category-select-label">Category</InputLabel>
          <Select
            labelId="category-select-label"
            value={selectedCategory}
            label="Category"
            onChange={handleCategoryChange}
            disabled={isLoading || isSaving}
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>{category}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center my-12">
          <CircularProgress />
        </div>
      ) : selectedCategory ? (
        <>
          <div className="flex justify-between mb-4">
            <Typography variant="h6">Fields Configuration</Typography>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={handleAddField}
              disabled={isSaving}
            >
              Add Field
            </Button>
          </div>
          
          {Object.keys(fieldsConfig).length === 0 ? (
            <Alert severity="info" className="my-4">
              No fields configured for this category. Click "Add Field" to get started.
            </Alert>
          ) : (
            <div className="space-y-4">
              {Object.entries(fieldsConfig).map(([field, options]) => (
                <Accordion key={field} defaultExpanded>
                  <AccordionSummary
                    expandIcon={<ExpandMore />}
                    aria-controls={`${field}-content`}
                    id={`${field}-header`}
                    className="bg-gray-50"
                  >
                    <div className="flex justify-between items-center w-full pr-4">
                      <Typography variant="subtitle1" className="font-medium">{field}</Typography>
                      <Button 
                        size="small" 
                        color="error" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFieldRemove(field);
                        }}
                        disabled={isSaving}
                      >
                        Remove
                      </Button>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails>
                    <div className="space-y-4">
                      <div className="flex justify-end">
                        <Button 
                          size="small" 
                          variant="outlined" 
                          onClick={() => handleAddOption(field)}
                          disabled={isSaving}
                        >
                          Add Option
                        </Button>
                      </div>
                      
                      {Object.keys(options).length === 0 ? (
                        <Alert severity="info">
                          No options configured for this field. Click "Add Option" to add some.
                        </Alert>
                      ) : (
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Option</TableCell>
                                <TableCell align="right">Points</TableCell>
                                <TableCell align="right">Actions</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {Object.entries(options).map(([option, points]) => (
                                <TableRow key={option}>
                                  <TableCell component="th" scope="row">
                                    {option}
                                  </TableCell>
                                  <TableCell align="right">
                                    <TextField
                                      type="number"
                                      size="small"
                                      value={points}
                                      onChange={(e) => handlePointsChange(field, option, e.target.value)}
                                      InputProps={{ inputProps: { min: 0, max: 1000 } }}
                                      disabled={isSaving}
                                    />
                                  </TableCell>
                                  <TableCell align="right">
                                    <Button 
                                      size="small" 
                                      color="error"
                                      onClick={() => handleOptionRemove(field, option)}
                                      disabled={isSaving}
                                    >
                                      Remove
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </div>
                  </AccordionDetails>
                </Accordion>
              ))}
            </div>
          )}
        </>
      ) : (
        <Alert severity="info" className="my-8">
          Select a category to configure its points.
        </Alert>
      )}
      
      {/* Impact Analysis Dialog */}
      <Dialog
        open={showImpactDialog}
        onClose={() => setShowImpactDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Points Configuration Impact Analysis
        </DialogTitle>
        <DialogContent>
          {impactLoading ? (
            <div className="flex justify-center my-8">
              <CircularProgress />
            </div>
          ) : impactData ? (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded">
                  <Typography variant="h6" className="font-bold text-blue-900">
                    {impactData.totalEventsAffected}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Events Affected
                  </Typography>
                </div>
                <div className="bg-blue-50 p-4 rounded">
                  <Typography variant="h6" className="font-bold text-blue-900">
                    {impactData.totalStudentsAffected}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Students Affected
                  </Typography>
                </div>
                <div className={`p-4 rounded ${impactData.totalPointsChange >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                  <Typography variant="h6" className={`font-bold ${impactData.totalPointsChange >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {impactData.totalPointsChange >= 0 ? '+' : ''}{impactData.totalPointsChange}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Points Change
                  </Typography>
                </div>
              </div>
              
              {impactData.mostImpactedStudents && impactData.mostImpactedStudents.length > 0 && (
                <div>
                  <Typography variant="subtitle1" className="font-semibold mb-2">
                    Most Impacted Students
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Register No</TableCell>
                          <TableCell align="right">Events</TableCell>
                          <TableCell align="right">Points Change</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {impactData.mostImpactedStudents.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell>{student.name}</TableCell>
                            <TableCell>{student.registerNo}</TableCell>
                            <TableCell align="right">{student.eventCount}</TableCell>
                            <TableCell align="right">
                              <span className={student.pointsDiff >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {student.pointsDiff >= 0 ? '+' : ''}{student.pointsDiff}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </div>
              )}
              
              {Object.keys(impactData.fieldImpacts || {}).length > 0 && (
                <div>
                  <Typography variant="subtitle1" className="font-semibold mb-2">
                    Field-wise Impact
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Field</TableCell>
                          <TableCell align="right">Events Affected</TableCell>
                          <TableCell align="right">Total Points Change</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(impactData.fieldImpacts).map(([field, data]) => (
                          <TableRow key={field}>
                            <TableCell>{field}</TableCell>
                            <TableCell align="right">{data.eventsAffected}</TableCell>
                            <TableCell align="right">
                              <span className={data.totalChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {data.totalChange >= 0 ? '+' : ''}{data.totalChange}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </div>
              )}
            </div>
          ) : (
            <Alert severity="error">Failed to load impact data</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowImpactDialog(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={saveChanges}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Apply Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CategoryPointsConfig;