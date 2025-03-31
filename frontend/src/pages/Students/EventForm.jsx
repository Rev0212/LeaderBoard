import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from 'lucide-react';

const EventForm = () => {
  const [formData, setFormData] = useState({
    eventName: '',
    description: '',
    date: '',
    proofImage: null,
    pdfDocument: null,
    category: '',
    positionSecured: '',
    priceMoney: '',
    participationType: '',
    eventLocation: '',
    otherCollegeName: '',
    eventScope: '',
    eventOrganizer: ''
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [pdfPreview, setPdfPreview] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();

  // Check various conditions for showing fields
  const shouldShowPrizeMoney = ['First', 'Second', 'Third'].includes(formData.positionSecured);
  const shouldShowCollegeName = formData.eventLocation === 'Outside College';
  const shouldShowEventDetails = ['Hackathon', 'Ideathon', 'Coding', 'Workshop', 'Conference'].includes(formData.category);

  const getBasicFields = () => [
    {
      section: 'Basic Information',
      fields: [
        { name: 'eventName', label: 'Event Name', type: 'text', placeholder: 'Enter Event Name' },
        { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Enter Description' },
        { name: 'date', label: 'Date', type: 'date' },
        { 
          name: 'category', 
          label: 'Category', 
          type: 'select', 
          options: ['Select a category', 'Hackathon', 'Ideathon', 'Coding', 'Global-Certificates', 'Workshop', 'Conference', 'Others'] 
        }
      ]
    }
  ];

  const getEventDetailFields = () => shouldShowEventDetails ? [
    {
      section: 'Event Details',
      fields: [
        { 
          name: 'eventLocation', 
          label: 'Event Location', 
          type: 'select', 
          options: ['Select location', 'Within College', 'Outside College']
        },
        ...(shouldShowCollegeName ? [{
          name: 'otherCollegeName',
          label: 'College Name',
          type: 'text',
          placeholder: 'Enter College Name'
        }] : []),
        { 
          name: 'eventScope', 
          label: 'Event Scope', 
          type: 'select', 
          options: ['Select scope', 'International', 'National', 'State'] 
        },
        { 
          name: 'eventOrganizer', 
          label: 'Event Organizer', 
          type: 'select', 
          options: ['Select organizer type', 'Industry Based', 'College Based'] 
        },
        { 
          name: 'participationType', 
          label: 'Participation Type', 
          type: 'select', 
          options: ['Select type', 'Individual', 'Team'] 
        }
      ]
    }
  ] : [];

  const getAchievementFields = () => [
    {
      section: 'Achievement Details',
      fields: [
        { 
          name: 'positionSecured', 
          label: 'Position Secured', 
          type: 'select', 
          options: ['Select position', 'First', 'Second', 'Third', 'Participant', 'None'] 
        },
        ...(shouldShowPrizeMoney ? [{
          name: 'priceMoney',
          label: 'Prize Money',
          type: 'text',
          placeholder: 'Enter Prize Amount'
        }] : [])
      ]
    }
  ];

  const getDocumentFields = () => [
    {
      section: 'Supporting Documents',
      fields: [
        { name: 'proofImage', label: 'Proof Image', type: 'file', accept: 'image/*' },
        { name: 'pdfDocument', label: 'PDF Document', type: 'file', accept: 'application/pdf' }
      ]
    }
  ];

  // Combine all sections based on conditions
  const formFields = [
    ...getBasicFields(),
    ...getEventDetailFields(),
    ...getAchievementFields(),
    ...getDocumentFields()
  ];

  const validateImage = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 2 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      return 'Please upload a valid image file (JPEG, PNG, or GIF)';
    }
    if (file.size > maxSize) {
      return 'Image size should be less than 5MB';
    }
    return null;
  };

  const validatePDF = (file) => {
    const maxSize = 2 * 1024 * 1024; // 5MB
    
    if (file.type !== 'application/pdf') {
      return 'Please upload a valid PDF file';
    }
    if (file.size > maxSize) {
      return 'PDF size should be less than 5MB';
    }
    return null;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    // Reset dependent fields when category changes
    if (name === 'category') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        eventLocation: '',
        otherCollegeName: '',
        eventScope: '',
        eventOrganizer: '',
        participationType: ''
      }));
      return;
    }
    
    if (name === 'proofImage' && files[0]) {
      const file = files[0];
      const error = validateImage(file);
      
      if (error) {
        setErrors(prev => ({ ...prev, proofImage: error }));
        return;
      }
      setErrors(prev => ({ ...prev, proofImage: null }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      setFormData(prev => ({
        ...prev,
        proofImage: file
      }));
    } else if (name === 'pdfDocument' && files[0]) {
      const file = files[0];
      const error = validatePDF(file);
      
      if (error) {
        setErrors(prev => ({ ...prev, pdfDocument: error }));
        e.target.value = ''; // Reset the file input
        return;
      }
      setErrors(prev => ({ ...prev, pdfDocument: null }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPdfPreview(file.name); // Just store the filename for display
      };
      reader.readAsDataURL(file);
      
      setFormData(prev => ({
        ...prev,
        pdfDocument: file
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Always validate basic fields
    const basicFields = getBasicFields().flatMap(section => section.fields);
    basicFields.forEach(field => {
      if (!formData[field.name]?.trim()) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });

    // Validate event detail fields only if category requires them
    if (shouldShowEventDetails) {
      const eventDetailFields = getEventDetailFields().flatMap(section => section.fields);
      eventDetailFields.forEach(field => {
        if (!formData[field.name]?.trim()) {
          newErrors[field.name] = `${field.label} is required`;
        }
      });
    }

    // Validate achievement and document fields
    const otherFields = [...getAchievementFields(), ...getDocumentFields()].flatMap(section => section.fields);
    otherFields.forEach(field => {
      if (field.name === 'proofImage' && !formData.proofImage) {
        newErrors[field.name] = 'Proof image is required';
      } else if (field.name === 'pdfDocument' && !formData.pdfDocument) {
        newErrors[field.name] = 'PDF document is required';
      } else if (field.type !== 'file' && !formData[field.name]?.trim()) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });

    // Additional validations
    if (shouldShowPrizeMoney && !formData.priceMoney?.trim()) {
      newErrors.priceMoney = 'Prize money is required for winning positions';
    }
    if (shouldShowCollegeName && !formData.otherCollegeName?.trim()) {
      newErrors.otherCollegeName = 'College name is required for outside college events';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      // setUploadStatus('Uploading files...');
      
      try {
        // Upload image to Cloudinary
        const formDataImage = new FormData();
        formDataImage.append('file', formData.proofImage);
        formDataImage.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
  
        const cloudinaryResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: formDataImage
          }
        );
  
        if (!cloudinaryResponse.ok) throw new Error('Failed to upload image');
        const cloudinaryData = await cloudinaryResponse.json();
  
        // Upload PDF
        const formDataPdf = new FormData();
        formDataPdf.append('pdfDocument', formData.pdfDocument);
  
        const pdfResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/event/upload-pdf`, {
          method: 'POST',
          body: formDataPdf
        });
  
        if (!pdfResponse.ok) throw new Error('Failed to upload PDF');
        const pdfData = await pdfResponse.json();
  
        setUploadStatus('Files uploaded successfully! Submitting form...');
  
        const formDataToSend = {
          ...formData,
          proofUrl: cloudinaryData.url,
          pdfDocument: pdfData.fileName,
        };
  
        // Submit form data
        const token = localStorage.getItem('student-token');
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/event/submit`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formDataToSend)
        });
  
        if (!response.ok) throw new Error('Failed to submit form');
  
        setUploadStatus('Form submitted successfully!');
        setTimeout(() => navigate("/student-dashboard"), 1500);
  
      } catch (error) {
        console.error('Submission error:', error);
        setApiError(error.message || 'An error occurred');
        setUploadStatus('');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-blue-600 py-4 px-6">
            <h2 className="text-2xl font-bold text-white text-center">Event Details Form</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Modified Basic Information section with side-by-side layout */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                Basic Information
              </h3>
              
              <div className="grid grid-cols-2 gap-6">
                {/* Left column */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Name
                    </label>
                    <input
                      type="text"
                      name="eventName"
                      value={formData.eventName}
                      onChange={handleChange}
                      placeholder="Enter Event Name"
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.eventName && (
                      <p className="mt-1 text-sm text-red-600">{errors.eventName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.date && (
                      <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      {['Select a category', 'Hackathon', 'Ideathon', 'Coding', 'Global-Certificates', 'Workshop', 'Conference', 'Others'].map((option, i) => (
                        <option key={i} value={option}>{option}</option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                    )}
                  </div>
                </div>
                
                {/* Right column - Description */}
                <div className="h-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter Description"
                    className="w-full h-[calc(100%-2rem)] px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="8"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Rest of the form sections */}
            {formFields.slice(1).map((section, sectionIndex) => (
              <div key={sectionIndex} className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                  {section.section}
                </h3>
                
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {section.fields.map((field, fieldIndex) => (
                    <div key={fieldIndex}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                        {field.name === 'pdfDocument' && " (Max 2MB)"}
                        {field.name === 'proofImage' && " (Max 2MB)"}
                      </label>
                      
                      {field.type === 'select' ? (
                        <select
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                        >
                          {field.options.map((option, i) => (
                            <option key={i} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : (
                        <div>
                          <input
                            type={field.type}
                            name={field.name}
                            onChange={handleChange}
                            value={field.type !== 'file' ? formData[field.name] : undefined}
                            placeholder={field.placeholder}
                            accept={field.accept}
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                          />
                          {field.name === 'proofImage' && imagePreview && (
                            <div className="mt-3">
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-32 h-32 object-cover rounded-md"
                              />
                            </div>
                          )}
                          {field.name === 'pdfDocument' && pdfPreview && !errors.pdfDocument && (
                            <div className="mt-3 flex items-center space-x-2 text-sm text-gray-600">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                              </svg>
                              <span>{formData.pdfDocument.name}</span>
                              <span className="text-xs">
                                ({(formData.pdfDocument.size / (1024 * 1024)).toFixed(2)} MB)
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {errors[field.name] && (
                        <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {apiError && (
              <div className="text-red-500 text-center p-3 bg-red-50 rounded-md">
                {apiError}
              </div>
            )}
            
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Submitting...' : 'Submit Event'}
              </button>
            </div>
            
            {uploadStatus && (
              <p className="text-sm text-center mt-4 text-gray-600">{uploadStatus}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventForm;