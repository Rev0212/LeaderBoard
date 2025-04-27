import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  TextField, FormControl, InputLabel, Select, MenuItem,
  Button, Typography, Paper, Box, CircularProgress,
  RadioGroup, FormControlLabel, Radio, FormGroup, Checkbox, IconButton, Alert, Tooltip
} from '@mui/material';
import { X, FileText, Info, HelpCircle, Image, Award } from 'react-feather';

const FieldWrapper = React.memo(({ children, affectsScore }) => (
  <div className={`relative ${affectsScore ? 'score-affecting-field' : ''}`}>
    {affectsScore && (
      <Tooltip title="This field affects your score" placement="top">
        <span className="absolute right-2 top-2">
          <Award size={16} className="text-yellow-500" />
        </span>
      </Tooltip>
    )}
    {children}
  </div>
));

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

const EditEventForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const eventToEdit = location.state?.event;
  
  // Add the validateDate function here
  const validateDate = (dateString) => {
    if (!dateString) return { isValid: false, error: 'Date is required' };
    
    const eventDate = new Date(dateString);
    const currentDate = new Date();
    const minDate = new Date('2010-01-01');
    
    // Reset time component for accurate comparison
    currentDate.setHours(0, 0, 0, 0);
    
    // Check if date is valid
    if (isNaN(eventDate.getTime())) {
      return { isValid: false, error: 'Invalid date format' };
    }
    
    // Check if date is in the future
    if (eventDate > currentDate) {
      return { isValid: false, error: 'Event date cannot be in the future' };
    }
    
    // Check if date is too far in the past
    if (eventDate < minDate) {
      return { isValid: false, error: 'Event date cannot be before 2010' };
    }
    
    return { isValid: true, error: null };
  };
  
  // Continue with existing code...
  // Redirect if no event to edit or not pending
  useEffect(() => {
    if (!eventToEdit) {
      toast.error('No event to edit');
      navigate('/student-dashboard');
      return;
    }
    
    if (eventToEdit.status?.toLowerCase() !== 'pending') {
      toast.error('Only pending events can be edited');
      navigate('/student-dashboard');
      return;
    }
  }, [eventToEdit, navigate]);
  
  // Same state variables as EventForm but initialized with event data
  const [categories, setCategories] = useState([]);
  const [positions, setPositions] = useState([]);
  const [eventScopes, setEventScopes] = useState([]);
  const [eventLocations, setEventLocations] = useState([]);
  const [eventOrganizers, setEventOrganizers] = useState([]);
  const [participationTypes, setParticipationTypes] = useState([]);
  
  const [formFields, setFormFields] = useState({
    requiredFields: [],
    optionalFields: [],
    conditionalFields: {},
    customQuestions: [],
    proofConfig: {}
  });

  // Initialize formData with event values
  const [formData, setFormData] = useState({
    eventName: eventToEdit?.eventName || '',
    date: eventToEdit?.date ? new Date(eventToEdit.date).toISOString().split('T')[0] : '',
    category: eventToEdit?.category || '', // Use actual category from event
    positionSecured: eventToEdit?.positionSecured || '',
    eventLocation: eventToEdit?.eventLocation || '',
    eventScope: eventToEdit?.eventScope || '',
    eventOrganizer: eventToEdit?.eventOrganizer || '',
    participationType: eventToEdit?.participationType || '',
    priceMoney: eventToEdit?.priceMoney || '',
    teamSize: eventToEdit?.teamSize || '',
    teamName: eventToEdit?.teamName || '',
    publicationType: eventToEdit?.publicationType || '',
    description: eventToEdit?.description || ''
  });

  const [visibleFields, setVisibleFields] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [certificateFiles, setCertificateFiles] = useState([]);
  const [customAnswers, setCustomAnswers] = useState({});
  const [formError, setFormError] = useState(null);

  const defaultConditionalFields = {
    priceMoney: {
      dependsOn: 'positionSecured',
      showWhen: ['First', 'Second', 'Third']
    }
  };

  const [pointsPreview, setPointsPreview] = useState({
    total: 0,
    breakdown: {},
    scoringFields: []
  });
  
  const [categoryHelpText, setCategoryHelpText] = useState('');
  const [scoringRules, setScoringRules] = useState({});
  const pointsCalculationTimeout = useRef(null);
  
  // Add these new state variables near the beginning of your component
  const [keepExistingCertificates, setKeepExistingCertificates] = useState(true);
  const [keepExistingPdf, setKeepExistingPdf] = useState(true);
  const [existingCertificates, setExistingCertificates] = useState([]);
  const [existingPdfUrl, setExistingPdfUrl] = useState('');

  // Replace your current customAnswers initialization effect with this improved version
  useEffect(() => {
    if (eventToEdit) {
      // Create a combined set of answers, prioritizing dynamicFields (they're more current)
      const answers = {};
      
      // First load from customAnswers
      if (eventToEdit.customAnswers) {
        if (typeof eventToEdit.customAnswers === 'object' && !Array.isArray(eventToEdit.customAnswers)) {
          if (eventToEdit.customAnswers instanceof Map) {
            for (const [key, value] of eventToEdit.customAnswers.entries()) {
              answers[key] = value;
            }
          } else {
            Object.entries(eventToEdit.customAnswers).forEach(([key, value]) => {
              answers[key] = value;
            });
          }
        }
      }
      
      // Then also check dynamicFields and override with their values if they exist
      // This ensures we get the most up-to-date values
      if (eventToEdit.dynamicFields) {
        Object.entries(eventToEdit.dynamicFields).forEach(([key, value]) => {
          if (key.startsWith('customAnswer_')) {
            const actualKey = key.replace('customAnswer_', '');
            answers[actualKey] = value;
          }
        });
      }
      
      console.log("Initialized custom answers with combined data:", answers);
      setCustomAnswers(answers);
      
      // Initialize existing certificates and PDF
      if (eventToEdit?.proofUrl && eventToEdit.proofUrl.length > 0) {
        setExistingCertificates(eventToEdit.proofUrl);
      }
      
      if (eventToEdit?.pdfDocument) {
        setExistingPdfUrl(eventToEdit.pdfDocument);
      }
    }
  }, [eventToEdit]);

  useEffect(() => {
    fetchFormConfiguration();
    fetchScoringRules();
  }, []);

  useEffect(() => {
    if (formData.category) {
      fetchFormFields(formData.category);
    }
  }, [formData.category]);

  useEffect(() => {
    updateVisibleFields();
  }, [formData, formFields]);

  const fetchFormConfiguration = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("student-token");
      
      const response = await axios.get(
        `${VITE_BASE_URL}/event/form-configuration`,
        { 
          headers: { 
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        const config = response.data.data;
        
        console.log("Form configuration loaded successfully:", config);
        setCategories(config.categories || []);
        setPositions(config.positionTypes || []);
        setEventScopes(config.eventScopes || []);
        setEventLocations(config.eventLocations || []);
        setEventOrganizers(config.eventOrganizers || []);
        setParticipationTypes(config.participationTypes || []);
      } else {
        throw new Error(`Failed to load form configuration: ${response.data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error fetching form configuration:", error);
      toast.error("Could not load form options. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchScoringRules = async () => {
    try {
      const token = localStorage.getItem("student-token");
      const response = await axios.get(
        `${VITE_BASE_URL}/event/scoring-rules`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setScoringRules(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch scoring rules:", error);
    }
  };

  const fetchFormFields = async (category) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("student-token");
      
      const encodedCategory = encodeURIComponent(category);
      console.log(`Fetching form fields for category: ${category}`);
      
      const response = await axios.get(
        `${VITE_BASE_URL}/event/form-fields/${encodedCategory}`,
        { 
          headers: { 
            Authorization: `Bearer ${token}`
          } 
        }
      );

      if (response.data.success && response.data.data) {
        const formFieldsData = response.data.data;
        
        // Ensure prize money is handled as a conditional field
        if (!formFieldsData.conditionalFields) {
          formFieldsData.conditionalFields = {};
        }
        
        // Remove priceMoney from required/optional fields if present
        formFieldsData.requiredFields = formFieldsData.requiredFields.filter(f => f !== 'priceMoney');
        formFieldsData.optionalFields = formFieldsData.optionalFields.filter(f => f !== 'priceMoney');
        
        // Add default conditional fields if not already set
        formFieldsData.conditionalFields = {
          ...defaultConditionalFields,
          ...formFieldsData.conditionalFields
        };

        // Set category help text if available
        if (response.data.data.categoryHelpText) {
          setCategoryHelpText(response.data.data.categoryHelpText);
        } else {
          // Generate generic help text based on category
          setCategoryHelpText(`Edit your ${category} event with all required details for proper evaluation.`);
        }

        setFormFields(formFieldsData);
        
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error("Failed to fetch form fields:", error);
      toast.error(`Could not load form configuration for ${category}. Please try again later.`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateVisibleFields = () => {
    // Start with base fields
    let fieldsToShow = [
      ...formFields.requiredFields,
      ...formFields.optionalFields
    ];
    
    // Remove fields that should be conditional
    fieldsToShow = fieldsToShow.filter(field => 
      !Object.keys(formFields.conditionalFields || {}).includes(field)
    );
    
    // Add conditional fields if their conditions are met
    Object.entries(formFields.conditionalFields || {}).forEach(([field, condition]) => {
      const { dependsOn, showWhen } = condition;
      if (formData[dependsOn] && showWhen.includes(formData[dependsOn])) {
        fieldsToShow.push(field);
      }
    });
    
    setVisibleFields([...new Set(fieldsToShow)]); // Remove any duplicates
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = {
      ...formData,
      [name]: value
    };
    
    setFormData(updatedFormData);
  };

  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

  const handleCertificateFilesChange = (e) => {
    const files = Array.from(e.target.files);
    setCertificateFiles(prevFiles => [...prevFiles, ...files]);
  };

  const removeCertificateFile = (index) => {
    setCertificateFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleCustomAnswerChange = (questionId, value) => {
    const updatedAnswers = {
      ...customAnswers,
      [questionId]: value
    };
    setCustomAnswers(updatedAnswers);
  };

  // Replace the validateForm function with this updated version
  const validateForm = () => {
    // Existing validation for required fields
    const missingFields = formFields.requiredFields.filter(
      field => !formData[field]
    );
    
    if (missingFields.length > 0) {
      setFormError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return false;
    }
    
    // Validation for custom questions
    const requiredQuestions = formFields.customQuestions?.filter(q => q.required) || [];
    const missingAnswers = requiredQuestions.filter(q => {
      const answer = customAnswers[q.id];
      
      if (q.type === 'multipleChoice') {
        return !answer || answer.length === 0;
      }
      
      // For both text and singleChoice
      return !answer || answer.trim() === '';
    });
    
    if (missingAnswers.length > 0) {
      setFormError(`Please answer all required questions: ${missingAnswers.map(q => q.text).join(', ')}`);
      return false;
    }
    
    // Modified certificate validation to account for keeping existing files
    if (formFields.proofConfig?.requireCertificateImage && 
        !keepExistingCertificates && 
        certificateFiles.length === 0 && 
        !eventToEdit.proofUrl?.length) {
      setFormError('Please upload at least one certificate image or keep existing ones');
      return false;
    }
    
    // Modified PDF validation to account for keeping existing files
    if (formFields.proofConfig?.requirePdfProof && 
        !keepExistingPdf && 
        !pdfFile && 
        !eventToEdit.pdfDocument) {
      setFormError('Please attach a PDF document as proof or keep the existing one');
      return false;
    }

    // Date validation
    if (formData.date) {
      const { isValid, error } = validateDate(formData.date);
      if (!isValid) {
        setFormError(error);
        return false;
      }
    }
    
    setFormError(null);
    return true;
  };

  // Update handleSubmit function to include the keepExisting flags
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    const submitData = new FormData();
    console.log("Updating event data:", formData);
    
    // Append all form data
    Object.keys(formData).forEach(key => {
      if (formData[key] !== undefined && formData[key] !== null) {
        submitData.append(key, formData[key]);
      }
    });
    
    // Append custom answers
    Object.entries(customAnswers).forEach(([questionId, answer]) => {
      if (Array.isArray(answer)) {
        answer.forEach(option => submitData.append(`customAnswer_${questionId}[]`, option));
      } else {
        submitData.append(`customAnswer_${questionId}`, answer);
      }
    });

    // Add flags for keeping existing files
    submitData.append('keepExistingCertificates', keepExistingCertificates);
    submitData.append('keepExistingPdf', keepExistingPdf);

    // Only append certificate files if not keeping existing ones
    if (!keepExistingCertificates) {
      certificateFiles.forEach(file => {
        submitData.append('certificateImages', file);
      });
    }

    // Only append PDF document if not keeping existing one
    if (!keepExistingPdf && pdfFile) {
      submitData.append('pdfDocument', pdfFile);
    }
    
    try {
      const token = localStorage.getItem("student-token");
      const response = await axios.put(
        `${VITE_BASE_URL}/event/pending/${eventToEdit._id}`,
        submitData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data.success) {
        toast.success('🎉 Event updated successfully!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          onClose: () => {
            navigate('/student-dashboard');
          }
        });
      } else {
        toast.error(`❌ ${response.data.message || 'Failed to update event'}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error(`❌ ${error.response?.data?.message || 'Failed to update event. Please try again.'}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isScoreAffectingField = (fieldName) => {
    return pointsPreview.scoringFields.includes(fieldName);
  };

  const renderCategoryHelp = () => {
    if (!categoryHelpText) return null;
    
    return (
      <Alert severity="info" className="mb-4">
        <div className="flex">
          <HelpCircle size={20} className="mr-2" />
          <Typography variant="body2">{categoryHelpText}</Typography>
        </div>
      </Alert>
    );
  };

  const renderField = (fieldName) => {
    const isRequired = formFields.requiredFields.includes(fieldName);
    const affectsScore = isScoreAffectingField(fieldName);
    
    switch (fieldName) {
      case 'eventName':
        return (
          <FieldWrapper affectsScore={affectsScore}>
            <TextField
              name="eventName"
              label="Event Name"
              value={formData.eventName}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required={isRequired}
            />
          </FieldWrapper>
        );
        
      case 'date':
        return (
          <FieldWrapper affectsScore={affectsScore}>
            <TextField
              name="date"
              label="Event Date"
              type="date"
              value={formData.date}
              onChange={(e) => {
                handleInputChange(e);
                
                // Validate date on change
                const { isValid, error } = validateDate(e.target.value);
                if (!isValid) {
                  setFormError(error);
                } else {
                  // Only clear form error if it was a date error
                  if (formError && formError.includes('date')) {
                    setFormError(null);
                  }
                }
              }}
              InputLabelProps={{ shrink: true }}
              fullWidth
              margin="normal"
              required={isRequired}
              error={formError && formError.includes('date')}
              helperText={formError && formError.includes('date') ? formError : ''}
            />
          </FieldWrapper>
        );
        
      case 'category':
        return (
          <FieldWrapper affectsScore={affectsScore}>
            <FormControl fullWidth margin="normal" required={isRequired}>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                label="Category"
                disabled={true} // Make it read-only
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300
                    }
                  }
                }}
              >
                {categories.length > 0 ? (
                  categories.map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))
                ) : (
                  <MenuItem value={formData.category}>{formData.category}</MenuItem>
                )}
              </Select>
            </FormControl>
          </FieldWrapper>
        );
        
      case 'positionSecured':
        return (
          <FieldWrapper affectsScore={affectsScore}>
            <FormControl fullWidth margin="normal" required={isRequired}>
              <InputLabel>Position Secured</InputLabel>
              <Select
                name="positionSecured"
                value={formData.positionSecured}
                onChange={handleInputChange}
                label="Position Secured"
              >
                {positions.map(position => (
                  <MenuItem key={position} value={position}>{position}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </FieldWrapper>
        );
        
      case 'eventLocation':
        return (
          <FieldWrapper affectsScore={affectsScore}>
            <FormControl fullWidth margin="normal" required={isRequired}>
              <InputLabel>Event Location</InputLabel>
              <Select
                name="eventLocation"
                value={formData.eventLocation}
                onChange={handleInputChange}
                label="Event Location"
              >
                {eventLocations.map(location => (
                  <MenuItem key={location} value={location}>{location}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </FieldWrapper>
        );
        
      case 'eventScope':
        return (
          <FieldWrapper affectsScore={affectsScore}>
            <FormControl fullWidth margin="normal" required={isRequired}>
              <InputLabel>Event Scope</InputLabel>
              <Select
                name="eventScope"
                value={formData.eventScope}
                onChange={handleInputChange}
                label="Event Scope"
              >
                {eventScopes.map(scope => (
                  <MenuItem key={scope} value={scope}>{scope}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </FieldWrapper>
        );
        
      case 'eventOrganizer':
        return (
          <FieldWrapper affectsScore={affectsScore}>
            <FormControl fullWidth margin="normal" required={isRequired}>
              <InputLabel>Event Organizer</InputLabel>
              <Select
                name="eventOrganizer"
                value={formData.eventOrganizer}
                onChange={handleInputChange}
                label="Event Organizer"
              >
                {eventOrganizers.map(organizer => (
                  <MenuItem key={organizer} value={organizer}>{organizer}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </FieldWrapper>
        );
        
      case 'participationType':
        return (
          <FieldWrapper affectsScore={affectsScore}>
            <FormControl fullWidth margin="normal" required={isRequired}>
              <InputLabel>Participation Type</InputLabel>
              <Select
                name="participationType"
                value={formData.participationType}
                onChange={handleInputChange}
                label="Participation Type"
              >
                {participationTypes.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </FieldWrapper>
        );
        
      case 'priceMoney':
        return (
          <FieldWrapper affectsScore={affectsScore}>
            <TextField
              name="priceMoney"
              label="Prize Money"
              value={formData.priceMoney}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required={isRequired}
              type="number"
            />
          </FieldWrapper>
        );
        
      case 'teamSize':
        return (
          <FieldWrapper affectsScore={affectsScore}>
            <TextField
              name="teamSize"
              label="Team Size"
              value={formData.teamSize}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required={isRequired}
              type="number"
            />
          </FieldWrapper>
        );
        
      case 'teamName':
        return (
          <FieldWrapper affectsScore={affectsScore}>
            <TextField
              name="teamName"
              label="Team Name"
              value={formData.teamName}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required={isRequired}
            />
          </FieldWrapper>
        );
        
      case 'publicationType':
        return (
          <FieldWrapper affectsScore={affectsScore}>
            <FormControl fullWidth margin="normal" required={isRequired}>
              <InputLabel>Publication Type</InputLabel>
              <Select
                name="publicationType"
                value={formData.publicationType}
                onChange={handleInputChange}
                label="Publication Type"
              >
                {["IEEE", "Springer", "ACM", "Other"].map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </FieldWrapper>
        );
        
      case 'description':
        return (
          <FieldWrapper affectsScore={affectsScore}>
            <TextField
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required={isRequired}
              multiline
              rows={4}
            />
          </FieldWrapper>
        );
        
      default:
        return null;
    }
  };

  const getFullImageUrl = (url) => {
    if (!url) return '';
    
    // If it's already a full URL, return as is
    if (url.startsWith('http')) {
      return url;
    }
    
    // Otherwise, prefix with backend URL
    return `${VITE_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
  };

  useEffect(() => {
    if (formFields.customQuestions?.length > 0 && Object.keys(customAnswers).length > 0) {
      console.log("Form questions:", formFields.customQuestions.map(q => q.id));
      console.log("Custom answer keys:", Object.keys(customAnswers));
      
      // Create a debug log showing each question and its current answer
      formFields.customQuestions.forEach(question => {
        console.log(`Question (${question.id}): "${question.text}" has answer:`, 
          customAnswers[question.id] || 'NO ANSWER FOUND');
      });
      
      // Force re-render of answers for these specific questions
      const updatedAnswers = { ...customAnswers };
      let changed = false;
      
      // Check if answers need type correction (e.g., string vs array)
      formFields.customQuestions.forEach(question => {
        if (question.type === 'multipleChoice' && updatedAnswers[question.id] && 
            !Array.isArray(updatedAnswers[question.id])) {
          // Convert string to array if needed for multipleChoice
          updatedAnswers[question.id] = [updatedAnswers[question.id]];
          changed = true;
        }
      });
      
      if (changed) {
        console.log("Updating answers with type corrections:", updatedAnswers);
        setCustomAnswers(updatedAnswers);
      }
    }
  }, [formFields.customQuestions, customAnswers]);

  return (
    <div className="p-6">
      <Paper className="p-6 shadow-md">
        <Typography variant="h5" className="mb-4 font-medium text-gray-800">
          Edit Event
        </Typography>
        
        {formError && (
          <Alert severity="error" className="mb-4" onClose={() => setFormError(null)}>
            {formError}
          </Alert>
        )}
        
        <Alert severity="info" className="mb-4">
          You are editing a pending event. Changes will be reviewed by a teacher.
        </Alert>
        
        {isLoading ? (
          <Box className="flex justify-center my-8">
            <CircularProgress />
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            {formData.category && renderCategoryHelp()}
            
            {formData.category && (
              <div className="mb-6 bg-blue-50 p-4 rounded border border-blue-100">
                <Typography variant="subtitle1" className="flex items-center">
                  <Info size={16} className="mr-2 text-blue-500" />
                  Editing an event in the <strong className="mx-1">{formData.category}</strong> category
                </Typography>
              </div>
            )}
            
            <div className="mb-6">
              <Typography variant="h6" className="mb-2 text-gray-800 font-medium">1. Event Category</Typography>
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                {renderField('category')}
              </div>
            </div>
            
            {formData.category && visibleFields.length > 0 ? (
              <div className="mb-6">
                <Typography variant="h6" className="mb-2 text-gray-800 font-medium">2. Event Details</Typography>
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm space-y-4">
                  {visibleFields
                    .filter(field => field !== 'category')
                    .map(field => (
                      <div key={field} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                        {renderField(field)}
                      </div>
                    ))
                  }
                </div>
              </div>
            ) : formData.category ? (
              <div className="bg-yellow-50 p-4 border border-yellow-200 rounded-md my-4">
                <Typography variant="body2" className="text-yellow-800">
                  Loading form fields for this category...
                </Typography>
              </div>
            ) : null}
            
            {formFields.customQuestions?.length > 0 && (
              <div className="mb-6">
                <Typography variant="h6" className="mb-2 text-gray-800 font-medium">
                  3. Additional Information
                </Typography>
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  {formFields.customQuestions.map(question => (
                    <div key={question.id} className="mb-4 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                      <Typography 
                        variant="subtitle1" 
                        className="mb-2 font-medium"
                      >
                        {question.text} {question.required && <span className="text-red-500">*</span>}
                      </Typography>
                      
                      {question.type === 'text' && (
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          value={customAnswers[question.id] || ''}
                          onChange={(e) => handleCustomAnswerChange(question.id, e.target.value)}
                          required={question.required}
                        />
                      )}

                      {question.type === 'singleChoice' && (
                        <RadioGroup
                          value={customAnswers[question.id] || ''}
                          onChange={(e) => handleCustomAnswerChange(question.id, e.target.value)}
                          required={question.required}
                        >
                          {question.options.map((option, index) => (
                            <FormControlLabel
                              key={index}
                              value={option}
                              control={<Radio />}
                              label={
                                <Typography variant="body2">
                                  {option}
                                </Typography>
                              }
                            />
                          ))}
                        </RadioGroup>
                      )}

                      {question.type === 'multipleChoice' && (
                        <FormGroup>
                          {question.options.map((option, index) => (
                            <FormControlLabel
                              key={index}
                              control={
                                <Checkbox
                                  checked={customAnswers[question.id]?.includes(option) || false}
                                  onChange={(e) => {
                                    const currentAnswers = customAnswers[question.id] || [];
                                    let newAnswers;
                                    if (e.target.checked) {
                                      newAnswers = [...currentAnswers, option];
                                    } else {
                                      newAnswers = currentAnswers.filter(ans => ans !== option);
                                    }
                                    handleCustomAnswerChange(question.id, newAnswers);
                                  }}
                                />
                              }
                              label={<Typography variant="body2">{option}</Typography>}
                            />
                          ))}
                        </FormGroup>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(formFields.proofConfig?.requireCertificateImage || formFields.proofConfig?.requirePdfProof) && (
              <div className="mb-6">
                <Typography variant="h6" className="mb-2 text-gray-800 font-medium">4. Supporting Evidence</Typography>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  
                  {formFields.proofConfig?.requireCertificateImage && (
                    <div className="mb-6">
                      <Typography variant="subtitle1" className="mb-2 flex items-center font-medium">
                        <Image size={18} className="mr-2 text-blue-500" />
                        Certificate Images 
                        {formFields.proofConfig.requireCertificateImage && 
                         !keepExistingCertificates && 
                         certificateFiles.length === 0 && 
                         !eventToEdit.proofUrl?.length && 
                         <span className="text-red-500 ml-1">*</span>}
                      </Typography>
                      
                      {/* Display existing certificates */}
                      {existingCertificates.length > 0 && (
                        <div className="mb-4">
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={keepExistingCertificates}
                                onChange={(e) => setKeepExistingCertificates(e.target.checked)}
                              />
                            }
                            label="Keep existing certificate images"
                          />
                          
                          {keepExistingCertificates && (
                            <div className="mt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                              {existingCertificates.map((url, index) => (
                                <div key={index} className="relative border rounded overflow-hidden">
                                  <img 
                                    src={getFullImageUrl(url)}
                                    alt={`Existing Certificate ${index + 1}`}
                                    className="w-full h-20 object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Show upload field if not keeping existing or none exist */}
                      {(!keepExistingCertificates || existingCertificates.length === 0) && (
                        <>
                          <input
                            accept="image/*"
                            type="file"
                            onChange={handleCertificateFilesChange}
                            multiple={formFields.proofConfig.allowMultipleCertificates}
                            className="w-full border p-2 rounded mb-2"
                          />
                          
                          {formFields.proofConfig.maxCertificateSize && (
                            <Typography variant="caption" color="textSecondary">
                              Max file size: {formFields.proofConfig.maxCertificateSize}MB
                              {formFields.proofConfig.allowMultipleCertificates ? '. Multiple files allowed.' : ''}
                            </Typography>
                          )}
                          
                          {certificateFiles.length > 0 && (
                            <div className="mt-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                              {certificateFiles.map((file, index) => (
                                <div key={index} className="relative border rounded overflow-hidden">
                                  <img 
                                    src={URL.createObjectURL(file)}
                                    alt={`Certificate ${index + 1}`}
                                    className="w-full h-20 object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeCertificateFile(index)}
                                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {formFields.proofConfig?.requirePdfProof && (
                    <div>
                      <Typography variant="subtitle1" className="mb-2 flex items-center font-medium">
                        <FileText size={18} className="mr-2 text-blue-500" />
                        PDF Proof Document 
                        {formFields.proofConfig.requirePdfProof && 
                         !keepExistingPdf && 
                         !pdfFile && 
                         !eventToEdit.pdfDocument && 
                         <span className="text-red-500 ml-1">*</span>}
                      </Typography>
                      
                      {/* Display existing PDF */}
                      {existingPdfUrl && (
                        <div className="mb-4">
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={keepExistingPdf}
                                onChange={(e) => setKeepExistingPdf(e.target.checked)}
                              />
                            }
                            label="Keep existing PDF document"
                          />
                          
                          {keepExistingPdf && (
                            <div className="mt-2 p-2 bg-gray-50 border rounded flex items-center justify-between">
                              <div className="flex items-center">
                                <FileText className="mr-2 text-blue-500" size={18} />
                                <Typography variant="body2">
                                  Existing PDF document
                                  <a 
                                    href={getFullImageUrl(existingPdfUrl)} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="ml-2 text-blue-500 underline"
                                  >
                                    View
                                  </a>
                                </Typography>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Show upload field if not keeping existing or none exists */}
                      {(!keepExistingPdf || !existingPdfUrl) && (
                        <>
                          <input
                            accept="application/pdf"
                            type="file"
                            onChange={handleFileChange}
                            className="w-full border p-2 rounded mb-2"
                          />
                          
                          {formFields.proofConfig.maxPdfSize && (
                            <Typography variant="caption" color="textSecondary">
                              Max file size: {formFields.proofConfig.maxPdfSize}MB
                            </Typography>
                          )}
                          
                          {pdfFile && (
                            <div className="mt-2 p-2 bg-gray-50 border rounded flex items-center justify-between">
                              <div className="flex items-center">
                                <FileText className="mr-2 text-blue-500" size={18} />
                                <Typography variant="body2">{pdfFile.name}</Typography>
                              </div>
                              <IconButton size="small" onClick={() => setPdfFile(null)}>
                                <X size={16} />
                              </IconButton>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
                        
            <Box className="mt-8 flex justify-end border-t pt-4">
              <Button
                type="button"
                variant="outlined"
                color="secondary"
                className="mr-4"
                onClick={() => navigate('/student-dashboard')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                className="px-6"
              >
                {isSubmitting ? 'Updating...' : 'Update Event'}
              </Button>
            </Box>
          </form>
        )}
      </Paper>
      <ToastContainer />
    </div>
  );
};

export default EditEventForm;