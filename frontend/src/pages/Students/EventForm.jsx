import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  TextField, FormControl, InputLabel, Select, MenuItem,
  Button, Typography, Paper, Box, CircularProgress
} from '@mui/material';

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

const EventForm = () => {
  const [categories, setCategories] = useState([]);
  const [positions, setPositions] = useState([]);
  const [eventScopes, setEventScopes] = useState([]);
  const [eventLocations, setEventLocations] = useState([]);
  const [eventOrganizers, setEventOrganizers] = useState([]);
  const [participationTypes, setParticipationTypes] = useState([]);
  
  const [formFields, setFormFields] = useState({
    requiredFields: [],
    optionalFields: [],
    conditionalFields: {}
  });

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    category: '',
    positionSecured: '',
    eventLocation: '',
    eventScope: '',
    eventOrganizer: '',
    participationType: '',
    priceMoney: '',
    teamSize: '',
    teamName: '',
    publicationType: '',
    description: ''
  });

  const [visibleFields, setVisibleFields] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);

  useEffect(() => {
    fetchEnums();
  }, []);

  useEffect(() => {
    if (formData.category) {
      fetchFormFields(formData.category);
    }
  }, [formData.category]);

  useEffect(() => {
    updateVisibleFields();
  }, [formData, formFields]);

  const fetchEnums = async () => {
    try {
      const token = localStorage.getItem("student-token");
      
      // Fetch categories - fix the request
      try {
        const categoriesRes = await axios.get(
          `${VITE_BASE_URL}/admin/config/type/category`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (categoriesRes.data.success) {
          setCategories(categoriesRes.data.data.values || []);
          console.log("Categories loaded:", categoriesRes.data.data.values);
        } else {
          console.error("Failed to load categories:", categoriesRes.data);
        }
      } catch (catError) {
        console.error("Categories fetch error:", catError);
        // Fallback to hardcoded categories if API fails
        setCategories(["Hackathon", "Paper Publication", "Conference", "Competition", "Other"]);
      }
      
      // Fetch positions
      const positionsRes = await axios.get(
        `${VITE_BASE_URL}/admin/config/type/positionSecured`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (positionsRes.data.success) {
        setPositions(positionsRes.data.data.values || []);
      }
      
      // Fetch other enums
      const eventScopesRes = await axios.get(
        `${VITE_BASE_URL}/admin/config/type/eventScope`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (eventScopesRes.data.success) {
        setEventScopes(eventScopesRes.data.data.values || []);
      }
      
      const eventLocationsRes = await axios.get(
        `${VITE_BASE_URL}/admin/config/type/eventLocation`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (eventLocationsRes.data.success) {
        setEventLocations(eventLocationsRes.data.data.values || []);
      }
      
      const eventOrganizersRes = await axios.get(
        `${VITE_BASE_URL}/admin/config/type/eventOrganizer`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (eventOrganizersRes.data.success) {
        setEventOrganizers(eventOrganizersRes.data.data.values || []);
      }
      
      const participationTypesRes = await axios.get(
        `${VITE_BASE_URL}/admin/config/type/participationType`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (participationTypesRes.data.success) {
        setParticipationTypes(participationTypesRes.data.data.values || []);
      }
      
    } catch (error) {
      console.error("Failed to fetch enum values:", error);
      toast.error("Could not load form options");
    }
  };

  const fetchFormFields = async (category) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("student-token");
      const response = await axios.get(
        `${VITE_BASE_URL}/admin/config/form-fields/${category}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setFormFields(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch form fields:", error);
      // Fall back to default fields
      setFormFields({
        requiredFields: ['title', 'date', 'category', 'positionSecured'],
        optionalFields: ['eventLocation', 'eventScope', 'eventOrganizer', 'description'],
        conditionalFields: {}
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateVisibleFields = () => {
    // Start with required and optional fields
    let fieldsToShow = [
      ...formFields.requiredFields,
      ...formFields.optionalFields
    ];
    
    // Add conditional fields if their conditions are met
    Object.entries(formFields.conditionalFields || {}).forEach(([field, condition]) => {
      const { dependsOn, showWhen } = condition;
      if (formData[dependsOn] && showWhen.includes(formData[dependsOn])) {
        fieldsToShow.push(field);
      }
    });
    
    setVisibleFields(fieldsToShow);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Create form data with file
    const submitData = new FormData();
    
    // Add all form fields
    Object.keys(formData).forEach(key => {
      if (visibleFields.includes(key) && formData[key]) {
        submitData.append(key, formData[key]);
      }
    });
    
    // Add PDF file
    if (pdfFile) {
      submitData.append('pdfDocument', pdfFile);
    }
    
    try {
      const token = localStorage.getItem("student-token");
      const response = await axios.post(
        `${VITE_BASE_URL}/event/submit`,
        submitData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data.success) {
        toast.success('Event submitted successfully!');
        resetForm();
      } else {
        toast.error(response.data.message || 'Failed to submit event');
      }
    } catch (error) {
      console.error('Error submitting event:', error);
      toast.error(error.response?.data?.message || 'Error submitting event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = () => {
    // Check required fields
    const missingFields = formFields.requiredFields.filter(
      field => !formData[field]
    );
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return false;
    }
    
    // Check if PDF document is attached
    if (!pdfFile) {
      toast.error('Please attach a PDF document as proof');
      return false;
    }
    
    return true;
  };

  const resetForm = () => {
    setFormData({
      title: '',
      date: '',
      category: '',
      positionSecured: '',
      eventLocation: '',
      eventScope: '',
      eventOrganizer: '',
      participationType: '',
      priceMoney: '',
      teamSize: '',
      teamName: '',
      publicationType: '',
      description: ''
    });
    setPdfFile(null);
  };

  // Define all possible form fields
  const renderField = (fieldName) => {
    // Helper to check if a field should be rendered
    const isRequired = formFields.requiredFields.includes(fieldName);
    
    switch (fieldName) {
      case 'title':
        return (
          <TextField
            name="title"
            label="Event Title"
            value={formData.title}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            required={isRequired}
          />
        );
        
      case 'date':
        return (
          <TextField
            name="date"
            label="Event Date"
            type="date"
            value={formData.date}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
            margin="normal"
            required={isRequired}
          />
        );
        
      case 'category':
        return (
          <FormControl fullWidth margin="normal" required={isRequired}>
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              label="Category"
            >
              {categories.map(category => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              ))}
            </Select>
          </FormControl>
        );
        
      case 'positionSecured':
        return (
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
        );
        
      case 'eventLocation':
        return (
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
        );
        
      case 'eventScope':
        return (
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
        );
        
      case 'eventOrganizer':
        return (
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
        );
        
      case 'participationType':
        return (
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
        );
        
      case 'priceMoney':
        return (
          <TextField
            name="priceMoney"
            label="Prize Money (if any)"
            value={formData.priceMoney}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            required={isRequired}
            type="number"
          />
        );
        
      case 'teamSize':
        return (
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
        );
        
      case 'teamName':
        return (
          <TextField
            name="teamName"
            label="Team Name"
            value={formData.teamName}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            required={isRequired}
          />
        );
        
      case 'publicationType':
        return (
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
        );
        
      case 'description':
        return (
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
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <Paper className="p-6">
        <Typography variant="h5" className="mb-4">
          Submit New Event
        </Typography>
        
        {isLoading ? (
          <Box className="flex justify-center my-8">
            <CircularProgress />
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            {formData.category && (
              <div className="bg-blue-50 p-4 mb-4 rounded">
                <Typography variant="subtitle1">
                  Submitting an event in the <strong>{formData.category}</strong> category
                </Typography>
              </div>
            )}
            
            {/* Always show category first, regardless of form fields config */}
            {renderField('category')}
            
            {formData.category && visibleFields
              .filter(field => field !== 'category') // Skip category as we've already rendered it
              .map(field => (
                <div key={field}>
                  {renderField(field)}
                </div>
              ))
            }
            
            <div className="mt-4">
              <Typography variant="subtitle1" className="mb-2">
                Upload Proof Document (PDF)
              </Typography>
              <input
                accept="application/pdf"
                type="file"
                onChange={handleFileChange}
                className="w-full border p-2 rounded"
              />
            </div>
            
            <Box className="mt-6 flex justify-end">
              <Button
                type="button"
                variant="outlined"
                className="mr-2"
                onClick={resetForm}
                disabled={isSubmitting}
              >
                Reset
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                startIcon={isSubmitting && <CircularProgress size={20} />}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Event'}
              </Button>
            </Box>
          </form>
        )}
      </Paper>
    </div>
  );
};

export default EventForm;