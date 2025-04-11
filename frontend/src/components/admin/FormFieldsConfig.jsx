import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Box, Button, CircularProgress, TextField, Alert, Typography, Divider,
  FormControl, InputLabel, Select, MenuItem, Paper, Card, CardContent,
  CardHeader, Chip, FormControlLabel, Switch, IconButton, Tab, Tabs,
  List, ListItem, ListItemText, ListItemSecondaryAction, Radio, RadioGroup,
  FormGroup, Checkbox, FormLabel, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Save, PlusCircle, Trash2, AlertTriangle, Edit, Image, FileText, Plus, X, Check, FileCode, Download, Upload } from 'lucide-react';

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

const fetchTemplatesForCategory = async (category) => {
  try {
    const token = localStorage.getItem("admin-token");
    const response = await axios.get(
      `${VITE_BASE_URL}/admin/config/templates/${category}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (response.data.success) {
      return response.data.templates;
    }
  } catch (error) {
    console.log("Fetching from localStorage instead");
  }

  const savedTemplates = localStorage.getItem('formFieldTemplates');
  if (savedTemplates) {
    const templates = JSON.parse(savedTemplates);
    return templates[category] || {};
  }

  return {};
};

const FormFieldsConfig = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  const [requiredFields, setRequiredFields] = useState([]);
  const [optionalFields, setOptionalFields] = useState([]);
  const [conditionalFields, setConditionalFields] = useState({});

  const [proofConfig, setProofConfig] = useState({
    requireCertificateImage: false,
    requirePdfProof: true,
    maxCertificateSize: 5,
    maxPdfSize: 10,
    allowMultipleCertificates: false
  });

  const [customQuestions, setCustomQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    type: 'text',
    required: true,
    options: ['']
  });

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

  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [templates, setTemplates] = useState({});
  const [selectedTemplateName, setSelectedTemplateName] = useState('');
  const [templatePreview, setTemplatePreview] = useState(null);
  const [newTemplateName, setNewTemplateName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchFormFieldConfig();
      loadTemplatesForCategory(selectedCategory);
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

        if (config.conditionalFields) {
          setConditionalFields(
            typeof config.conditionalFields === 'object' ?
            config.conditionalFields : {}
          );
        } else {
          setConditionalFields({});
        }

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

  const loadTemplatesForCategory = async (category) => {
    const categoryTemplates = await fetchTemplatesForCategory(category);
    setTemplates(categoryTemplates);
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

    const questionWithId = {
      ...newQuestion,
      id: `question_${Date.now()}`,
      options: newQuestion.type !== 'text' ? newQuestion.options.filter(opt => opt.trim() !== '') : []
    };

    setCustomQuestions([...customQuestions, questionWithId]);

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
        setSuccess('Form field configuration updated successfully');
        toast.success('Form field configuration updated successfully');
        fetchCategoryConfig(selectedCategory);
      } else {
        throw new Error(response.data.message || 'Failed to update configuration');
      }
    } catch (err) {
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
      toast.error('Failed to fetch updated configuration');
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const applyTemplate = (templateName) => {
    const template = templates[templateName];
    if (!template) {
      toast.error('Template not found');
      return;
    }

    setRequiredFields(template.requiredFields || []);
    setOptionalFields(template.optionalFields || []);
    setConditionalFields(template.conditionalFields || {});
    setProofConfig(template.proofConfig || {
      requireCertificateImage: false,
      requirePdfProof: true,
      maxCertificateSize: 5,
      maxPdfSize: 10,
      allowMultipleCertificates: false
    });
    setCustomQuestions(template.customQuestions || []);

    toast.success(`Applied template: ${templateName}`);
    setShowTemplateDialog(false);
  };

  const saveAsTemplate = () => {
    if (!newTemplateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    const currentTemplate = {
      requiredFields,
      optionalFields,
      conditionalFields,
      proofConfig,
      customQuestions
    };

    const updatedTemplates = {
      ...templates,
      [newTemplateName]: currentTemplate
    };

    setTemplates(updatedTemplates);

    const allTemplates = JSON.parse(localStorage.getItem('formFieldTemplates') || '{}');
    allTemplates[selectedCategory] = updatedTemplates;
    localStorage.setItem('formFieldTemplates', JSON.stringify(allTemplates));

    toast.success(`Template "${newTemplateName}" saved`);
    setNewTemplateName('');
  };

  const previewTemplate = (templateName) => {
    setSelectedTemplateName(templateName);
    setTemplatePreview(templates[templateName]);
  };

  const TemplateDialog = () => {
    return (
      <Dialog
        open={showTemplateDialog}
        onClose={() => setShowTemplateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <div className="flex justify-between items-center">
            <span>Form Field Templates for {selectedCategory}</span>
            <IconButton onClick={() => setShowTemplateDialog(false)}>
              <X size={18} />
            </IconButton>
          </div>
        </DialogTitle>

        <DialogContent>
          <div className="mb-6">
            <Typography variant="subtitle1" className="font-medium mb-2">
              Available Templates
            </Typography>

            {Object.keys(templates).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.keys(templates).map(templateName => (
                  <Paper
                    key={templateName}
                    className={`p-3 hover:bg-blue-50 cursor-pointer ${
                      selectedTemplateName === templateName ? 'border-2 border-blue-500' : ''
                    }`}
                    onClick={() => previewTemplate(templateName)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Typography variant="body1" className="font-medium">
                        {templateName}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          const updatedTemplates = { ...templates };
                          delete updatedTemplates[templateName];
                          setTemplates(updatedTemplates);

                          const allTemplates = JSON.parse(localStorage.getItem('formFieldTemplates') || '{}');
                          if (allTemplates[selectedCategory]) {
                            delete allTemplates[selectedCategory][templateName];
                            localStorage.setItem('formFieldTemplates', JSON.stringify(allTemplates));
                          }
                        }}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </div>
                    <div className="text-xs text-gray-500">
                      {templates[templateName].requiredFields?.length || 0} required,
                      {templates[templateName].optionalFields?.length || 0} optional fields
                    </div>
                  </Paper>
                ))}
              </div>
            ) : (
              <Alert severity="info" className="mb-4">
                No templates available for this category yet.
              </Alert>
            )}
          </div>

          {templatePreview && (
            <div className="mb-4">
              <Typography variant="subtitle1" className="font-medium mb-2">
                Template Preview: {selectedTemplateName}
              </Typography>

              <Paper elevation={0} variant="outlined" className="p-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Typography variant="subtitle2" className="mb-1">Required Fields:</Typography>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {templatePreview.requiredFields?.map(field => (
                        <Chip key={field} size="small" label={field} />
                      )) || 'None'}
                    </div>

                    <Typography variant="subtitle2" className="mb-1">Optional Fields:</Typography>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {templatePreview.optionalFields?.map(field => (
                        <Chip key={field} size="small" label={field} color="info" variant="outlined" />
                      )) || 'None'}
                    </div>
                  </div>

                  <div>
                    <Typography variant="subtitle2" className="mb-1">Proof Requirements:</Typography>
                    <ul className="text-sm mb-3">
                      <li>Certificate: {templatePreview.proofConfig?.requireCertificateImage ? 'Required' : 'Optional'}</li>
                      <li>PDF: {templatePreview.proofConfig?.requirePdfProof ? 'Required' : 'Optional'}</li>
                      <li>Multiple Images: {templatePreview.proofConfig?.allowMultipleCertificates ? 'Allowed' : 'Not Allowed'}</li>
                    </ul>

                    <Typography variant="subtitle2" className="mb-1">Custom Questions:</Typography>
                    <div className="text-sm">
                      {templatePreview.customQuestions?.length || 0} questions configured
                    </div>
                  </div>
                </div>

                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => applyTemplate(selectedTemplateName)}
                  className="mt-3"
                  fullWidth
                  startIcon={<Check size={16} />}
                >
                  Apply This Template
                </Button>
              </Paper>
            </div>
          )}

          <Divider className="my-4" />

          <div>
            <Typography variant="subtitle1" className="font-medium mb-2">
              Save Current Configuration as Template
            </Typography>

            <div className="flex items-center gap-2">
              <TextField
                label="Template Name"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                size="small"
                className="flex-grow"
              />
              <Button
                variant="contained"
                color="primary"
                onClick={saveAsTemplate}
                disabled={!newTemplateName.trim()}
                startIcon={<Save size={16} />}
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const renderTemplateButtons = () => {
    return (
      <div className="mb-4 flex gap-2">
        <Button
          variant="outlined"
          startIcon={<FileCode size={16} />}
          onClick={() => setShowTemplateDialog(true)}
        >
          Templates
        </Button>
      </div>
    );
  };

  const FormPreview = () => {
    return (
      <Paper elevation={0} variant="outlined" className="p-5 bg-gray-50">
        <Typography variant="h6" gutterBottom className="text-gray-700">
          Form Preview for {selectedCategory}
        </Typography>
        <Divider className="mb-4" />

        <div className="space-y-4">
          {requiredFields.map(field => (
            <div key={field} className="mb-3">
              <Typography variant="body2" className="font-medium mb-1">
                {field} <span className="text-red-500">*</span>
              </Typography>
              <div className="h-10 bg-white border border-gray-300 rounded-md"></div>
            </div>
          ))}

          {optionalFields.map(field => (
            <div key={field} className="mb-3">
              <Typography variant="body2" className="font-medium mb-1 text-gray-700">
                {field}
              </Typography>
              <div className="h-10 bg-white border border-gray-300 rounded-md"></div>
            </div>
          ))}

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
      {showTemplateDialog && <TemplateDialog />}

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

      {selectedCategory && renderTemplateButtons()}

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

                  <Paper variant="outlined" className="p-4">
                    <Typography variant="subtitle2" className="mb-3 font-medium">
                      Add New Question
                    </Typography>

                    <div className="grid grid-cols-1 gap-4">
                      <TextField
                        label="Question Text"
                        fullWidth
                        value={newQuestion.text}
                        onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
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