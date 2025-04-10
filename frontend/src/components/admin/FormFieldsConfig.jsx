import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Box, Button, CircularProgress, TextField, Alert,
  FormControl, InputLabel, Select, MenuItem, 
  Paper, Typography, Divider, Chip, Switch, FormControlLabel,
  List, ListItem, ListItemText, ListItemSecondaryAction, IconButton
} from '@mui/material';
import { Save, PlusCircle, Trash2, AlertTriangle } from 'lucide-react';

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

const FormFieldsConfig = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [requiredFields, setRequiredFields] = useState([]);
  const [optionalFields, setOptionalFields] = useState([]);
  const [conditionalFields, setConditionalFields] = useState({});
  const [availableFields, setAvailableFields] = useState([
    'title', 'date', 'eventLocation', 'eventScope', 'eventOrganizer', 
    'participationType', 'priceMoney', 'teamSize', 'teamName', 'publicationType'
  ]);
  const [newConditionalField, setNewConditionalField] = useState('');
  const [dependsOn, setDependsOn] = useState('');
  const [showWhen, setShowWhen] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchFormFieldConfig();
    }
  }, [selectedCategory]);

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
        setCategories(response.data.data.values || []);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("Could not load categories");
    }
  };

  const fetchFormFieldConfig = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("admin-token");
      const response = await axios.get(
        `${VITE_BASE_URL}/admin/config/form-fields/${selectedCategory}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        const config = response.data.data;
        setRequiredFields(config.requiredFields || []);
        setOptionalFields(config.optionalFields || []);
        
        // Convert Map to object if needed
        if (config.conditionalFields) {
          setConditionalFields(
            typeof config.conditionalFields === 'object' ? 
            config.conditionalFields : {}
          );
        } else {
          setConditionalFields({});
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Network error');
      toast.error('Failed to load form field configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const addFieldToRequired = (field) => {
    if (!requiredFields.includes(field)) {
      setRequiredFields([...requiredFields, field]);
      if (optionalFields.includes(field)) {
        setOptionalFields(optionalFields.filter(f => f !== field));
      }
    }
  };

  const addFieldToOptional = (field) => {
    if (!optionalFields.includes(field)) {
      setOptionalFields([...optionalFields, field]);
      if (requiredFields.includes(field)) {
        setRequiredFields(requiredFields.filter(f => f !== field));
      }
    }
  };

  const removeField = (field, list) => {
    if (list === 'required') {
      setRequiredFields(requiredFields.filter(f => f !== field));
    } else if (list === 'optional') {
      setOptionalFields(optionalFields.filter(f => f !== field));
    }
  };

  const addConditionalField = () => {
    if (!newConditionalField || !dependsOn || showWhen.length === 0) return;
    
    setConditionalFields({
      ...conditionalFields,
      [newConditionalField]: {
        dependsOn,
        showWhen
      }
    });
    
    // Clear form
    setNewConditionalField('');
    setDependsOn('');
    setShowWhen([]);
  };

  const removeConditionalField = (field) => {
    const updatedFields = { ...conditionalFields };
    delete updatedFields[field];
    setConditionalFields(updatedFields);
  };

  const saveConfig = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const token = localStorage.getItem("admin-token");
      const response = await axios.put(
        `${VITE_BASE_URL}/admin/config/form-fields/${selectedCategory}`,
        { 
          requiredFields,
          optionalFields,
          conditionalFields
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setSuccess('Form field configuration updated successfully');
        toast.success('Form field configuration updated successfully');
      } else {
        setError(response.data.message);
        toast.error(response.data.message);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update configuration';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Category Form Fields Configuration</h2>
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
              Configure which fields appear on the event submission form for each category.
              You can set required, optional, and conditional fields.
            </p>
          </div>
        </div>
      </div>
      
      <FormControl fullWidth className="mb-6">
        <InputLabel id="category-select-label">Event Category</InputLabel>
        <Select
          labelId="category-select-label"
          value={selectedCategory}
          label="Event Category"
          onChange={handleCategoryChange}
        >
          <MenuItem value="">
            <em>Select a category</em>
          </MenuItem>
          {categories.map(category => (
            <MenuItem key={category} value={category}>{category}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedCategory && (
        isLoading ? (
          <div className="flex justify-center my-8">
            <CircularProgress />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Paper variant="outlined" className="p-4">
                <Typography variant="h6" className="mb-3">
                  Required Fields
                </Typography>
                <div className="flex flex-wrap gap-2 mb-4">
                  {requiredFields.map(field => (
                    <Chip 
                      key={field}
                      label={field}
                      onDelete={() => removeField(field, 'required')}
                      className="mb-1"
                    />
                  ))}
                </div>
                <FormControl fullWidth size="small" className="mt-2">
                  <InputLabel id="add-required-label">Add Required Field</InputLabel>
                  <Select
                    labelId="add-required-label"
                    value=""
                    label="Add Required Field"
                    onChange={(e) => addFieldToRequired(e.target.value)}
                  >
                    {availableFields.map(field => (
                      <MenuItem 
                        key={field} 
                        value={field}
                        disabled={requiredFields.includes(field) || optionalFields.includes(field)}
                      >
                        {field}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Paper>

              <Paper variant="outlined" className="p-4">
                <Typography variant="h6" className="mb-3">
                  Optional Fields
                </Typography>
                <div className="flex flex-wrap gap-2 mb-4">
                  {optionalFields.map(field => (
                    <Chip 
                      key={field}
                      label={field}
                      onDelete={() => removeField(field, 'optional')}
                      className="mb-1"
                    />
                  ))}
                </div>
                <FormControl fullWidth size="small" className="mt-2">
                  <InputLabel id="add-optional-label">Add Optional Field</InputLabel>
                  <Select
                    labelId="add-optional-label"
                    value=""
                    label="Add Optional Field"
                    onChange={(e) => addFieldToOptional(e.target.value)}
                  >
                    {availableFields.map(field => (
                      <MenuItem 
                        key={field} 
                        value={field}
                        disabled={requiredFields.includes(field) || optionalFields.includes(field)}
                      >
                        {field}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Paper>
            </div>

            <Paper variant="outlined" className="p-4 mb-6">
              <Typography variant="h6" className="mb-3">
                Conditional Fields
              </Typography>
              
              {Object.keys(conditionalFields).length > 0 ? (
                <List>
                  {Object.entries(conditionalFields).map(([field, condition]) => (
                    <ListItem key={field} divider>
                      <ListItemText 
                        primary={field} 
                        secondary={`Show when ${condition.dependsOn} is ${condition.showWhen.join(' or ')}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" onClick={() => removeConditionalField(field)}>
                          <Trash2 size={18} />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="textSecondary" className="mb-3">
                  No conditional fields configured.
                </Typography>
              )}
              
              <Divider className="my-4" />
              
              <Typography variant="subtitle1" className="mb-2">
                Add Conditional Field
              </Typography>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <FormControl fullWidth size="small">
                  <InputLabel id="field-label">Field</InputLabel>
                  <Select
                    labelId="field-label"
                    value={newConditionalField}
                    label="Field"
                    onChange={(e) => setNewConditionalField(e.target.value)}
                  >
                    {availableFields.map(field => (
                      <MenuItem 
                        key={field} 
                        value={field}
                        disabled={Object.keys(conditionalFields).includes(field)}
                      >
                        {field}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl fullWidth size="small">
                  <InputLabel id="depends-on-label">Depends On</InputLabel>
                  <Select
                    labelId="depends-on-label"
                    value={dependsOn}
                    label="Depends On"
                    onChange={(e) => setDependsOn(e.target.value)}
                  >
                    {[...requiredFields, ...optionalFields].map(field => (
                      <MenuItem key={field} value={field}>{field}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
              
              <div className="mb-4">
                <Typography variant="body2" className="mb-1">
                  Show When (select values):
                </Typography>
                <div className="flex flex-wrap gap-2">
                  {["First", "Second", "Third", "Participated", "Team", "Individual", "International", "National"].map(value => (
                    <Chip 
                      key={value}
                      label={value}
                      onClick={() => {
                        if (showWhen.includes(value)) {
                          setShowWhen(showWhen.filter(v => v !== value));
                        } else {
                          setShowWhen([...showWhen, value]);
                        }
                      }}
                      color={showWhen.includes(value) ? "primary" : "default"}
                      variant={showWhen.includes(value) ? "filled" : "outlined"}
                      className="mb-1"
                    />
                  ))}
                </div>
              </div>
              
              <Button
                variant="outlined"
                color="primary"
                onClick={addConditionalField}
                disabled={!newConditionalField || !dependsOn || showWhen.length === 0}
                startIcon={<PlusCircle size={16} />}
              >
                Add Conditional Field
              </Button>
            </Paper>

            <div className="flex justify-end mt-4">
              <Button
                variant="contained"
                color="primary"
                onClick={saveConfig}
                disabled={isSaving}
                startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <Save size={16} />}
              >
                {isSaving ? 'Saving...' : 'Save Form Configuration'}
              </Button>
            </div>
          </>
        )
      )}
    </div>
  );
};

export default FormFieldsConfig;