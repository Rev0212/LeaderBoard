import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Box, Button, CircularProgress, TextField, Alert, Typography, Divider,
  FormControl, InputLabel, Select, MenuItem, Paper, Card, CardContent,
  CardHeader, Chip, FormControlLabel, Switch, IconButton, Tab, Tabs,
  List, ListItem, ListItemText, ListItemSecondaryAction, Radio, RadioGroup,
  FormGroup, Checkbox, FormLabel
} from '@mui/material';
import { Save, PlusCircle, Trash2, AlertTriangle, Edit, Image, FileText, Plus, X, Check } from 'lucide-react';

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

const FormFieldsConfig = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Basic fields configuration
  const [requiredFields, setRequiredFields] = useState([]);
  const [optionalFields, setOptionalFields] = useState([]);
  const [conditionalFields, setConditionalFields] = useState({});
  
  // Proof configuration
  const [proofConfig, setProofConfig] = useState({
    requireCertificateImage: false,
    requirePdfProof: true,
    maxCertificateSize: 5, // MB
    maxPdfSize: 10, // MB
    allowMultipleCertificates: false
  });
  
  // Custom questions
  const [customQuestions, setCustomQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    type: 'text', // text, singleChoice, multipleChoice
    required: true,
    options: [''] // for choice questions
  });
  
  // UI state
  const [activeTab, setActiveTab] = useState(0);
  const [availableFields, setAvailableFields] = useState([
    'title', 'date', 'eventLocation', 'eventScope', 'eventOrganizer', 
    'participationType', 'priceMoney', 'teamSize', 'teamName', 'publicationType',
    'description'
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
        
        // Handle conditional fields
        if (config.conditionalFields) {
          setConditionalFields(
            typeof config.conditionalFields === 'object' ? 
            config.conditionalFields : {}
          );
        } else {
          setConditionalFields({});
        }
        
        // Handle proof configuration
        if (config.proofConfig) {
          setProofConfig(config.proofConfig);
        } else {
          setProofConfig({
            requireCertificateImage: false,
            requirePdfProof: true,
            maxCertificateSize: 5,
            maxPdfSize: 10,
            allowMultipleCertificates: false
          });
        }
        
        // Handle custom questions
        if (config.customQuestions) {
          setCustomQuestions(config.customQuestions);
        } else {
          setCustomQuestions([]);
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

  const handleAddCustomQuestion = () => {
    if (!newQuestion.text) return;
    
    // Ensure each question has a unique ID
    const questionWithId = {
      ...newQuestion,
      id: `question_${Date.now()}`,
      options: newQuestion.type !== 'text' ? newQuestion.options.filter(opt => opt.trim() !== '') : []
    };
    
    setCustomQuestions([...customQuestions, questionWithId]);
    
    // Reset form
    setNewQuestion({
      text: '',
      type: 'text',
      required: true,
      options: ['']
    });
  };
  
  const handleQuestionOptionChange = (index, value) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = value;
    
    // Always keep one empty option at the end for adding new ones
    if (index === updatedOptions.length - 1 && value.trim() !== '') {
      updatedOptions.push('');
    }
    
    setNewQuestion({
      ...newQuestion,
      options: updatedOptions
    });
  };
  
  const removeQuestionOption = (index) => {
    if (newQuestion.options.length <= 1) return;
    
    const updatedOptions = [...newQuestion.options];
    updatedOptions.splice(index, 1);
    
    setNewQuestion({
      ...newQuestion,
      options: updatedOptions
    });
  };
  
  const removeCustomQuestion = (questionId) => {
    setCustomQuestions(customQuestions.filter(q => q.id !== questionId));
  };

  const saveConfig = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const configData = {
        requiredFields,
        optionalFields,
        conditionalFields,
        proofConfig: {
          ...proofConfig,
          // Ensure boolean values are explicitly set
          requireCertificateImage: Boolean(proofConfig.requireCertificateImage),
          requirePdfProof: Boolean(proofConfig.requirePdfProof),
          allowMultipleCertificates: Boolean(proofConfig.allowMultipleCertificates)
        },
        customQuestions: customQuestions.map(q => ({
          ...q,
          required: Boolean(q.required),
          options: q.options?.filter(opt => opt.trim() !== '') || []
        }))
      };

      console.log('Saving config:', configData);

      const token = localStorage.getItem("admin-token");
      const response = await axios.put(
        `${VITE_BASE_URL}/admin/config/form-fields/${selectedCategory}`,
        configData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        console.log('Save response:', response.data);
        setSuccess('Form field configuration updated successfully');
        toast.success('Form field configuration updated successfully');
        
        // Immediately fetch the updated configuration to verify
        fetchCategoryConfig(selectedCategory);
      } else {
        throw new Error(response.data.message || 'Failed to update configuration');
      }
    } catch (err) {
      console.error('Error saving config:', err);
      const errorMsg = err.response?.data?.message || 'Failed to update configuration';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const fetchCategoryConfig = async (category) => {
    try {
      const token = localStorage.getItem("admin-token");
      const response = await axios.get(
        `${VITE_BASE_URL}/admin/config/form-fields/${category}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );

      if (response.data.success && response.data.data) {
        const config = response.data.data;
        console.log('Fetched config:', config);
        
        // Update state with fetched values
        setRequiredFields(config.requiredFields || []);
        setOptionalFields(config.optionalFields || []);
        setConditionalFields(config.conditionalFields || {});
        setProofConfig({
          requireCertificateImage: Boolean(config.proofConfig?.requireCertificateImage),
          requirePdfProof: Boolean(config.proofConfig?.requirePdfProof),
          maxCertificateSize: config.proofConfig?.maxCertificateSize || 5,
          maxPdfSize: config.proofConfig?.maxPdfSize || 10,
          allowMultipleCertificates: Boolean(config.proofConfig?.allowMultipleCertificates)
        });
        setCustomQuestions(config.customQuestions || []);
      }
    } catch (error) {
      console.error('Error fetching category config:', error);
      toast.error('Failed to fetch updated configuration');
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Preview component to show how the form will appear to users
  const FormPreview = () => {
    return (
      <Paper elevation={0} variant="outlined" className="p-5 bg-gray-50">
        <Typography variant="h6" gutterBottom className="text-gray-700">
          Form Preview for {selectedCategory}
        </Typography>
        <Divider className="mb-4" />
        
        <div className="space-y-4">
          {/* Required fields */}
          {requiredFields.map(field => (
            <div key={field} className="mb-3">
              <Typography variant="body2" className="font-medium mb-1">
                {field} <span className="text-red-500">*</span>
              </Typography>
              <div className="h-10 bg-white border border-gray-300 rounded-md"></div>
            </div>
          ))}
          
          {/* Optional fields */}
          {optionalFields.map(field => (
            <div key={field} className="mb-3">
              <Typography variant="body2" className="font-medium mb-1 text-gray-700">
                {field}
              </Typography>
              <div className="h-10 bg-white border border-gray-300 rounded-md"></div>
            </div>
          ))}
          
          {/* Custom questions */}
          {customQuestions.map(question => (
            <div key={question.id} className="mb-3">
              <Typography variant="body2" className="font-medium mb-1">
                {question.text} {question.required && <span className="text-red-500">*</span>}
              </Typography>
              
              {question.type === 'text' && (
                <div className="h-10 bg-white border border-gray-300 rounded-md"></div>
              )}
              
              {question.type === 'singleChoice' && (
                <div className="pl-3">
                  {question.options.filter(o => o.trim() !== '').map((opt, idx) => (
                    <div key={idx} className="flex items-center">
                      <Radio disabled size="small" />
                      <Typography variant="body2">{opt}</Typography>
                    </div>
                  ))}
                </div>
              )}
              
              {question.type === 'multipleChoice' && (
                <div className="pl-3">
                  {question.options.filter(o => o.trim() !== '').map((opt, idx) => (
                    <div key={idx} className="flex items-center">
                      <Checkbox disabled size="small" />
                      <Typography variant="body2">{opt}</Typography>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {/* Proof uploads */}
          {proofConfig.requireCertificateImage && (
            <div className="mb-3">
              <Typography variant="body2" className="font-medium mb-1">
                Certificate Image <span className="text-red-500">*</span>
              </Typography>
              <div className="h-10 bg-white border border-gray-300 rounded-md flex items-center px-3">
                <Image size={16} className="text-gray-500 mr-2" />
                <Typography variant="caption" className="text-gray-500">
                  Upload certificate image(s) {proofConfig.allowMultipleCertificates ? '(multiple allowed)' : ''}
                </Typography>
              </div>
              <Typography variant="caption" className="text-gray-500">
                Max {proofConfig.maxCertificateSize}MB
              </Typography>
            </div>
          )}
          
          {proofConfig.requirePdfProof && (
            <div className="mb-3">
              <Typography variant="body2" className="font-medium mb-1">
                PDF Proof Document <span className="text-red-500">*</span>
              </Typography>
              <div className="h-10 bg-white border border-gray-300 rounded-md flex items-center px-3">
                <FileText size={16} className="text-gray-500 mr-2" />
                <Typography variant="caption" className="text-gray-500">
                  Upload PDF proof document
                </Typography>
              </div>
              <Typography variant="caption" className="text-gray-500">
                Max {proofConfig.maxPdfSize}MB
              </Typography>
            </div>
          )}
        </div>
      </Paper>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Category Form Fields Configuration</h2>
        <Button
          variant="contained"
          color="primary"
          disabled={!selectedCategory || isSaving}
          startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <Save size={16} />}
          onClick={saveConfig}
        >
          {isSaving ? 'Saving...' : 'Save Configuration'}
        </Button>
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
              Configure form fields, proof requirements, and custom questions for each category.
              These settings determine what students see when submitting events.
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
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
              <Tabs value={activeTab} onChange={handleTabChange} aria-label="form configuration tabs">
                <Tab label="Basic Fields" id="tab-0" />
                <Tab label="Proof Requirements" id="tab-1" />
                <Tab label="Custom Questions" id="tab-2" />
                <Tab label="Preview" id="tab-3" />
              </Tabs>
            </Box>

            {/* Basic Fields Tab */}
            {activeTab === 0 && (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <Card elevation={0} variant="outlined" className="border-green-200">
                    <CardHeader 
                      title="Required Fields" 
                      titleTypographyProps={{ variant: 'h6' }}
                      className="bg-green-50 pb-2"
                    />
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-4 min-h-[100px]">
                        {requiredFields.length > 0 ? (
                          requiredFields.map(field => (
                            <Chip 
                              key={field}
                              label={field}
                              onDelete={() => removeField(field, 'required')}
                              className="mb-1"
                              color="primary"
                              variant="outlined"
                            />
                          ))
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            No required fields selected
                          </Typography>
                        )}
                      </div>
                      <FormControl fullWidth size="small">
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
                    </CardContent>
                  </Card>

                  <Card elevation={0} variant="outlined" className="border-blue-200">
                    <CardHeader 
                      title="Optional Fields" 
                      titleTypographyProps={{ variant: 'h6' }}
                      className="bg-blue-50 pb-2"
                    />
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-4 min-h-[100px]">
                        {optionalFields.length > 0 ? (
                          optionalFields.map(field => (
                            <Chip 
                              key={field}
                              label={field}
                              onDelete={() => removeField(field, 'optional')}
                              className="mb-1"
                              color="info"
                              variant="outlined"
                            />
                          ))
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            No optional fields selected
                          </Typography>
                        )}
                      </div>
                      <FormControl fullWidth size="small">
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
                    </CardContent>
                  </Card>
                </div>

                <Card elevation={0} variant="outlined" className="mb-6 border-purple-200">
                  <CardHeader 
                    title="Conditional Fields" 
                    titleTypographyProps={{ variant: 'h6' }}
                    className="bg-purple-50 pb-2"
                  />
                  <CardContent>
                    {Object.keys(conditionalFields).length > 0 ? (
                      <List>
                        {Object.entries(conditionalFields).map(([field, condition]) => (
                          <ListItem key={field} divider className="bg-white rounded-lg mb-2 shadow-sm">
                            <ListItemText 
                              primary={
                                <span className="font-medium">{field}</span>
                              }
                              secondary={
                                <span>
                                  Show when <b>{condition.dependsOn}</b> is {condition.showWhen.map(sw => 
                                    <Chip key={sw} label={sw} size="small" variant="outlined" className="ml-1 mr-1" />
                                  )}
                                </span>
                              }
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
                    
                    <Typography variant="subtitle1" className="mb-2 font-medium">
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
                      <Typography variant="body2" className="mb-2">
                        Show When (select values):
                      </Typography>
                      <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
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
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Proof Requirements Tab */}
            {activeTab === 1 && (
              <Card elevation={0} variant="outlined" className="mb-6 border-amber-200">
                <CardHeader 
                  title="Proof Requirements" 
                  titleTypographyProps={{ variant: 'h6' }}
                  className="bg-amber-50 pb-2"
                />
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Paper variant="outlined" className="p-4">
                      <div className="flex items-start mb-4">
                        <Image size={24} className="mr-3 text-blue-500" />
                        <div>
                          <Typography variant="subtitle1" className="font-medium mb-1">
                            Certificate Image
                          </Typography>
                          <Typography variant="body2" color="textSecondary" className="mb-3">
                            Configure requirements for certificate images
                          </Typography>
                        </div>
                      </div>

                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Switch 
                              checked={Boolean(proofConfig.requireCertificateImage)}
                              onChange={(e) => {
                                const newValue = e.target.checked;
                                console.log('Setting requireCertificateImage to:', newValue);
                                setProofConfig(prev => ({
                                  ...prev,
                                  requireCertificateImage: newValue
                                }));
                              }}
                            />
                          }
                          label="Require Certificate Image"
                        />
                        
                        {proofConfig.requireCertificateImage && (
                          <>
                            <FormControlLabel
                              control={
                                <Switch 
                                  checked={proofConfig.allowMultipleCertificates}
                                  onChange={(e) => setProofConfig({
                                    ...proofConfig,
                                    allowMultipleCertificates: e.target.checked
                                  })}
                                />
                              }
                              label="Allow Multiple Images"
                            />
                            
                            <div className="mt-3">
                              <Typography variant="body2" gutterBottom>
                                Maximum File Size (MB):
                              </Typography>
                              <TextField
                                type="number"
                                value={proofConfig.maxCertificateSize}
                                onChange={(e) => setProofConfig({
                                  ...proofConfig,
                                  maxCertificateSize: Math.max(1, parseInt(e.target.value) || 1)
                                })}
                                size="small"
                                inputProps={{ min: 1, max: 20 }}
                              />
                            </div>
                          </>
                        )}
                      </FormGroup>
                    </Paper>

                    <Paper variant="outlined" className="p-4">
                      <div className="flex items-start mb-4">
                        <FileText size={24} className="mr-3 text-red-500" />
                        <div>
                          <Typography variant="subtitle1" className="font-medium mb-1">
                            PDF Proof Document
                          </Typography>
                          <Typography variant="body2" color="textSecondary" className="mb-3">
                            Configure requirements for PDF proof documents
                          </Typography>
                        </div>
                      </div>

                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Switch 
                              checked={Boolean(proofConfig.requirePdfProof)}
                              onChange={(e) => {
                                const newValue = e.target.checked;
                                console.log('Setting requirePdfProof to:', newValue);
                                setProofConfig(prev => ({
                                  ...prev,
                                  requirePdfProof: newValue
                                }));
                              }}
                            />
                          }
                          label="Require PDF Proof"
                        />
                        
                        {proofConfig.requirePdfProof && (
                          <div className="mt-3">
                            <Typography variant="body2" gutterBottom>
                              Maximum File Size (MB):
                            </Typography>
                            <TextField
                              type="number"
                              value={proofConfig.maxPdfSize}
                              onChange={(e) => setProofConfig({
                                ...proofConfig,
                                maxPdfSize: Math.max(1, parseInt(e.target.value) || 1)
                              })}
                              size="small"
                              inputProps={{ min: 1, max: 50 }}
                            />
                          </div>
                        )}
                      </FormGroup>
                    </Paper>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Custom Questions Tab */}
            {activeTab === 2 && (
              <Card elevation={0} variant="outlined" className="mb-6 border-indigo-200">
                <CardHeader 
                  title="Custom Questions" 
                  titleTypographyProps={{ variant: 'h6' }}
                  className="bg-indigo-50 pb-2"
                />
                <CardContent>
                  <Typography variant="body2" color="textSecondary" className="mb-4">
                    Add custom questions that will be shown on the event submission form for this category.
                  </Typography>

                  {/* Current Questions List */}
                  {customQuestions.length > 0 ? (
                    <div className="mb-5">
                      <Typography variant="subtitle2" className="mb-2 font-medium">
                        Current Questions:
                      </Typography>
                      <List>
                        {customQuestions.map((question, index) => (
                          <ListItem key={question.id} divider className="bg-white rounded-lg mb-2 shadow-sm">
                            <ListItemText 
                              primary={
                                <div className="flex items-center">
                                  <span className="font-medium">{question.text}</span>
                                  {question.required && 
                                    <Chip size="small" color="error" label="Required" className="ml-2" />
                                  }
                                </div>
                              }
                              secondary={
                                <div className="mt-1">
                                  <Chip 
                                    size="small" 
                                    label={
                                      question.type === 'text' ? 'Text Answer' : 
                                      question.type === 'singleChoice' ? 'Single Choice' : 
                                      'Multiple Choice'
                                    } 
                                    variant="outlined" 
                                  />
                                  {question.type !== 'text' && (
                                    <div className="mt-1 pl-2 text-xs">
                                      Options: {question.options.filter(o => o.trim() !== '').join(', ')}
                                    </div>
                                  )}
                                </div>
                              }
                            />
                            <ListItemSecondaryAction>
                              <IconButton edge="end" onClick={() => removeCustomQuestion(question.id)}>
                                <Trash2 size={18} />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    </div>
                  ) : (
                    <Alert severity="info" className="mb-4">
                      No custom questions added yet.
                    </Alert>
                  )}

                  {/* Add New Question Form */}
                  <Paper variant="outlined" className="p-4">
                    <Typography variant="subtitle2" className="mb-3 font-medium">
                      Add New Question
                    </Typography>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <TextField
                        label="Question Text"
                        fullWidth
                        value={newQuestion.text}
                        onChange={(e) => setNewQuestion({...newQuestion, text: e.target.value})}
                        placeholder="e.g., What did you learn from this experience?"
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormControl fullWidth size="small">
                          <InputLabel>Question Type</InputLabel>
                          <Select
                            value={newQuestion.type}
                            label="Question Type"
                            onChange={(e) => setNewQuestion({
                              ...newQuestion, 
                              type: e.target.value,
                              options: e.target.value !== 'text' ? [''] : []
                            })}
                          >
                            <MenuItem value="text">Text Answer</MenuItem>
                            <MenuItem value="singleChoice">Single Choice</MenuItem>
                            <MenuItem value="multipleChoice">Multiple Choice</MenuItem>
                          </Select>
                        </FormControl>
                        
                        <FormControlLabel
                          control={
                            <Switch 
                              checked={newQuestion.required}
                              onChange={(e) => setNewQuestion({
                                ...newQuestion,
                                required: e.target.checked
                              })}
                            />
                          }
                          label="Required Question"
                        />
                      </div>
                      
                      {/* Options for choice questions */}
                      {(newQuestion.type === 'singleChoice' || newQuestion.type === 'multipleChoice') && (
                        <div className="mt-2">
                          <FormLabel component="legend" className="text-sm mb-2">Options:</FormLabel>
                          {newQuestion.options.map((option, index) => (
                            <div key={index} className="flex items-center mb-2">
                              <TextField
                                value={option}
                                onChange={(e) => handleQuestionOptionChange(index, e.target.value)}
                                size="small"
                                placeholder={`Option ${index + 1}`}
                                className="flex-grow"
                              />
                              {index > 0 && index !== newQuestion.options.length - 1 && (
                                <IconButton size="small" onClick={() => removeQuestionOption(index)}>
                                  <X size={16} />
                                </IconButton>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleAddCustomQuestion}
                      disabled={!newQuestion.text || (
                        (newQuestion.type !== 'text') && 
                        newQuestion.options.filter(opt => opt.trim() !== '').length === 0
                      )}
                      className="mt-4"
                      startIcon={<Plus size={16} />}
                    >
                      Add Question
                    </Button>
                  </Paper>
                </CardContent>
              </Card>
            )}

            {/* Preview Tab */}
            {activeTab === 3 && <FormPreview />}

            <div className="flex justify-end mt-6">
              <Button
                variant="contained"
                color="primary"
                onClick={saveConfig}
                disabled={isSaving}
                startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <Save size={16} />}
              >
                {isSaving ? 'Saving...' : 'Save Configuration'}
              </Button>
            </div>
          </>
        )
      )}
    </div>
  );
};

export default FormFieldsConfig;