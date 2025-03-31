import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react'; // Import eye icons

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

// Form validation constants
const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,  
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_PATTERN: /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
};

const TeacherLoginForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [formData, setFormData] = useState({   
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [apiError, setApiError] = useState('');

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!VALIDATION_RULES.EMAIL_PATTERN.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setApiError('');
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const response = await axios.post(`${VITE_BASE_URL}/teacher/login`, formData);  
      localStorage.setItem('teacher-token', response.data.token);
      setSuccessMessage('Login successful!');
      
      // Check role and navigate to the correct dashboard
      const teacherRole = response.data.teacher?.role;
      
      if (teacherRole === 'HOD' || teacherRole === 'Academic Advisor') {
        navigate('/advisor-hod-dashboard');
      } else {
        navigate('/teacher-dashboard');
      }
      
      // Clear form data
      setFormData({
        email: '',
        password: '',
      });
    } catch (error) {
      setApiError(error.response?.data?.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const renderField = (name, label, type = 'text', placeholder) => {
    // Special handling for password field
    if (name === 'password') {
      return (
        <div className="mb-4 w-full">
          <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
          <div className="relative">
            <input
              id={name}
              type={showPassword ? 'text' : 'password'}
              name={name}
              value={formData[name]}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full px-4 py-2 border rounded-lg 
                focus:ring-blue-500 focus:border-blue-500
                disabled:bg-gray-100 disabled:cursor-not-allowed 
                sm:text-sm pr-10" // Added padding-right for the icon
              placeholder={placeholder}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors[name] && (
            <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
          )}
        </div>
      );
    }
    
    // For all other fields
    return (
      <div className="mb-4 w-full">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <input
          id={name}
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          disabled={isLoading}
          className="w-full px-4 py-2 border rounded-lg 
            focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-100 disabled:cursor-not-allowed 
            sm:text-sm"
          placeholder={placeholder}
        />
        {errors[name] && (
          <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
        )}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="bg-white shadow-md rounded-lg p-6 sm:p-8">
          <h2 className="text-center text-2xl font-bold text-gray-800 mb-6">
            Teacher Login
          </h2>

          {apiError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {renderField('email', 'Email', 'email', 'Enter your email')}
            {renderField('password', 'Password', 'password', 'Enter your password')}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 text-white py-2 rounded-lg 
                hover:bg-blue-600 transition duration-200 
                disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Submitting...' : 'Submit'}
            </button>
          </form>

          {successMessage && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              {successMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherLoginForm;