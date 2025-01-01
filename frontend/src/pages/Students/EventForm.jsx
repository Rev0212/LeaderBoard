import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;
console.log(VITE_BASE_URL);

const EventForm = () => {
  const [formData, setFormData] = useState({
    eventName: '',
    description: '',
    date: '',
    proofUrl: '',
    category: '',
    positionSecured: ''
  });

  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/");
  };

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const formFields = [
    { name: 'eventName', label: 'Event Name', type: 'text', placeholder: 'Enter Event Name' },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Enter Description' },
    { name: 'date', label: 'Date', type: 'date' },
    { name: 'proofUrl', label: 'Proof URL', type: 'url', placeholder: 'Enter Proof URL' },
    { name: 'category', label: 'Category', type: 'select', options: ['Select a category', 'Hackathon', 'Ideathon', 'Coding', 'Certificate', 'Workshop', 'Conference', 'Others'] },
    { name: 'positionSecured', label: 'Position Secured', type: 'select', options: ['Select position', 'First', 'Second', 'Third', 'Participant', 'None'] }
  ];

  const validateForm = () => {
    const newErrors = {};

    formFields.forEach(field => {
      if (!formData[field.name].trim()) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);

      const token = localStorage.getItem('student-token'); // Retrieve the token

      try {
        const response = await axios.post(
          `${VITE_BASE_URL}/event/submit`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`, 
            },
          }
        );

        if (response.status === 201) {
          setSubmitted(true);
          setTimeout(() => {
            handleBack();
          }, 1000); 
        }
      } catch (error) {
        if (error.response) {
          setApiError(error.response.data.message || 'Failed to submit the form');
        } else if (error.request) {
          setApiError('No response received from the server');
        } else {
          setApiError('An error occurred while setting up the request');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Event Details Form</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {formFields.map((field, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  rows="3"
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                field.type === 'select' ? (
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
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                )
              )}
              {errors[field.name] && <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>}
            </div>
          ))}

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full ${isLoading ? 'bg-gray-400' : 'bg-blue-600'} text-white py-2 px-4 rounded-md hover:${isLoading ? 'bg-gray-400' : 'bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              {isLoading ? 'Submitting...' : 'Submit'}
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  eventName: '',
                  description: '',
                  date: '',
                  proofUrl: '',
                  category: '',
                  positionSecured: ''
                });
                
                  handleBack(); 
  
              }}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>

          {submitted && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              <span>Form submitted successfully!</span>
            </div>
          )}

          {apiError && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              <span>{apiError}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EventForm;
