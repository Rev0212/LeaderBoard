import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
  const [formData, setFormData] = useState({   
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [apiError, setApiError] = useState('');

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!VALIDATION_RULES.EMAIL_PATTERN.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }//  else if (!VALIDATION_RULES.PASSWORD_PATTERN.test(formData.password)) {
    //   newErrors.password = `Password must contain at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters, one uppercase letter, one number, and one special character`;
    // }
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
      const data = response.data
      console.log(data)
      
      localStorage.setItem('token', response.data.token);
      setSuccessMessage('Login successful!');
      setFormData({
        email: '',
        password: '',
      });

      // Get user profile to determine role
      const profileResponse = await axios.get(
        `${VITE_BASE_URL}/teacher/profile`,
        {
            headers: {
                Authorization: `Bearer ${response.data.token}`,
                "Content-Type": "application/json"
            }
        }
      );
      
      // Redirect based on role
      const role = profileResponse.data.role;
      if (role === 'HOD' || role === 'Academic Advisor') {
          navigate("/advisor-hod-dashboard");
      } else {
          navigate("/teacher-dashboard");
      }
    } catch (error) {
      setApiError(error.response?.data?.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  const renderField = (name, label, type = 'text', placeholder) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={name}
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        disabled={isLoading}
        className="mt-1 px-4 py-2 w-full border rounded-lg focus:ring-blue-500 focus:border-blue-500 
                 disabled:bg-gray-100 disabled:cursor-not-allowed"
        placeholder={placeholder}
      />
      {errors[name] && (
        <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-10">
      <div className="w-full max-w-xl px-6">
        <div className="bg-white shadow-lg rounded-lg p-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Teacher Login
          </h2>
          
          {apiError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {renderField('email', 'Email', 'email', 'Enter your email')}
            {renderField('password', 'Password', 'password', 'Enter your password')}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 
                       transition duration-200 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Submiting...' : 'Submit'}
            </button>
          </form>

          {successMessage && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              {successMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherLoginForm;