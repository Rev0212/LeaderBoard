import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

const EventForm = () => {
  const [formData, setFormData] = useState({
    eventName: '',
    description: '',
    date: '',
    proofImage: null,
    category: '',
    positionSecured: '',
    priceMoney: ''
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const formFields = [
    { name: 'eventName', label: 'Event Name', type: 'text', placeholder: 'Enter Event Name' },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Enter Description' },
    { name: 'date', label: 'Date', type: 'date' },
    { name: 'proofImage', label: 'Proof Image', type: 'file', accept: 'image/*' },
    { name: 'category', label: 'Category', type: 'select', options: ['Select a category', 'Hackathon', 'Ideathon', 'Coding', 'Global-Certificates', 'Workshop', 'Conference', 'Others'] },
    { name: 'priceMoney', label: 'Price Money', type: 'text', placeholder: 'Enter Price Money' },
    { name: 'positionSecured', label: 'Position Secured', type: 'select', options: ['Select position', 'First', 'Second', 'Third', 'Participant', 'None'] }
  ];

  const validateImage = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      return 'Please upload a valid image file (JPEG, PNG, or GIF)';
    }
    if (file.size > maxSize) {
      return 'Image size should be less than 5MB';
    }
    return null;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'proofImage' && files[0]) {
      const file = files[0];
      const error = validateImage(file);
      
      if (error) {
        setErrors(prev => ({ ...prev, proofImage: error }));
        return;
      }

      // Clear any previous errors
      setErrors(prev => ({ ...prev, proofImage: null }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      setFormData(prev => ({
        ...prev,
        proofImage: file
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

    formFields.forEach(field => {
      if (field.name === 'proofImage' && !formData.proofImage) {
        newErrors[field.name] = 'Proof image is required';
      } else if (field.type !== 'file' && !formData[field.name].trim()) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      setUploadStatus('Uploading image...');

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

        if (!cloudinaryResponse.ok) {
          throw new Error('Failed to upload image');
        }

        const cloudinaryData = await cloudinaryResponse.json();

        setUploadStatus('Image uploaded successfully! Submitting form...');

        const formDataToSend = {
          eventName: formData.eventName,
          description: formData.description,
          date: formData.date,
          category: formData.category,
          positionSecured: formData.positionSecured,
          priceMoney: formData.priceMoney,
          proofUrl: cloudinaryData.url  
        };

        console.log(formDataToSend);

        // Submit form data to backend
        const token = localStorage.getItem('student-token');
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/event/submit`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formDataToSend)
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          throw new Error('Failed to submit form');
        }

        setUploadStatus('Form submitted successfully!');
        setTimeout(() => navigate("/"), 1500);

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
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Event Details Form</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {formFields.map((field, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              
              {field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  rows="3"
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              ) : field.type === 'select' ? (
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
                    placeholder={field.placeholder}
                    accept={field.accept}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  {field.type === 'file' && imagePreview && (
                    <div className="mt-2">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="max-w-full h-32 object-contain rounded-md"
                      />
                    </div>
                  )}
                </div>
              )}
              
              {errors[field.name] && (
                <p className="mt-1 text-sm text-red-600">
                  {errors[field.name]}
                </p>
              )}
            </div>
          ))}

          {uploadStatus && (
            <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-md">
              {uploadStatus}
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full ${
                isLoading ? 'bg-gray-400' : 'bg-blue-600'
              } text-white py-2 px-4 rounded-md hover:${
                isLoading ? 'bg-gray-400' : 'bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              {isLoading ? 'Submitting...' : 'Submit'}
            </button>
            
            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>

          {apiError && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
              {apiError}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EventForm;