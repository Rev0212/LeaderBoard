import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff, User, Lock, LogIn, AlertCircle, Book } from 'lucide-react';
import { motion } from 'framer-motion';

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

// Form validation constants
const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,  
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_PATTERN: /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
};

const StudentLoginForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      const response = await axios.post(`${VITE_BASE_URL}/student/login`, formData);  
      localStorage.setItem('student-token', response.data.token);
      setSuccessMessage('Login successful!');
      setFormData({
        email: '',
        password: '',
      });
      navigate('/student-dashboard');
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

  // Generate random particles for the background with better spread
  const particles = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    size: Math.random() * 6 + 4,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 30 + 40, // Slower movement (40-70 seconds)
    delay: Math.random() * 5
  }));

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gray-50">
      {/* Main background with gradient */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-[#6e8cca] to-[#a3b8e0]"
      />

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-white"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
            }}
            initial={{ 
              x: `${particle.x}vw`, 
              y: `${particle.y}vh`,
              opacity: 0
            }}
            animate={{ 
              x: [
                `${particle.x}vw`, 
                `${(particle.x + 10) % 100}vw`, 
                `${(particle.x - 5 + 100) % 100}vw`, 
                `${particle.x}vw`
              ],
              y: [
                `${particle.y}vh`, 
                `${(particle.y - 15 + 100) % 100}vh`, 
                `${(particle.y + 10) % 100}vh`, 
                `${particle.y}vh`
              ],
              opacity: [0.2, 0.4, 0.3, 0.2]
            }}
            transition={{ 
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Animated wave pattern */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 1 }}
      >
        <svg width="100%" height="100%" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <motion.path 
            d="M0,288L48,272C96,256,192,224,288,224C384,224,480,256,576,250.7C672,245,768,203,864,181.3C960,160,1056,160,1152,186.7C1248,213,1344,267,1392,293.3L1440,320L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            fill="white"
            initial={{ y: 100 }}
            animate={{ y: [100, 50, 100] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
      </motion.div>

      {/* Login Card */}
      <motion.div 
        className="relative w-full max-w-md p-8 z-10"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* Logo with floating animation */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="bg-white w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Book className="h-10 w-10" style={{ color: '#6e8cca' }} />
          </motion.div>
        </motion.div>

        <motion.div
          className="bg-white bg-opacity-95 backdrop-blur-lg rounded-xl shadow-xl overflow-hidden border border-gray-100"
          whileHover={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-8">
            <motion.div 
              className="text-center"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Student Portal</h2>
              <p className="mb-8" style={{ color: '#6e8cca' }}>Sign in to access your learning dashboard</p>
            </motion.div>

            {apiError && (
              <motion.div 
                className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-600 rounded"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {apiError}
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email field with staggered animation */}
              <motion.div
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5" style={{ color: '#6e8cca' }} />
                  </div>
                  <motion.input
                    whileFocus={{ scale: 1.01, boxShadow: '0 0 0 3px rgba(110, 140, 202, 0.2)' }}
                    transition={{ type: "spring", stiffness: 300 }}
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="pl-10 block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 transition-all duration-200 focus:border-[#6e8cca] focus:ring-2 focus:ring-[#6e8cca] focus:ring-opacity-20"
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-red-500"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </motion.div>

              {/* Password field with staggered animation */}
              <motion.div
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5" style={{ color: '#6e8cca' }} />
                  </div>
                  <motion.input
                    whileFocus={{ scale: 1.01, boxShadow: '0 0 0 3px rgba(110, 140, 202, 0.2)' }}
                    transition={{ type: "spring", stiffness: 300 }}
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="pl-10 block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 transition-all duration-200 focus:border-[#6e8cca] focus:ring-2 focus:ring-[#6e8cca] focus:ring-opacity-20"
                    placeholder="Enter your password"
                  />
                  <motion.button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 transition-colors"
                    onClick={togglePasswordVisibility}
                    whileHover={{ scale: 1.1, color: '#6e8cca' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </motion.button>
                </div>
                {errors.password && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-red-500"
                  >
                    {errors.password}
                  </motion.p>
                )}
              </motion.div>

              {/* Button with animation */}
              <motion.div
                className="pt-2"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: '0 10px 15px -3px rgba(110, 140, 202, 0.3)' }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center px-4 py-3 text-white font-medium rounded-lg focus:outline-none transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
                  style={{ backgroundColor: '#6e8cca' }}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-5 w-5 mr-2" />
                      Sign in
                    </>
                  )}
                </motion.button>
              </motion.div>
            </form>

            {successMessage && (
              <motion.div 
                className="mt-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-600 rounded"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {successMessage}
              </motion.div>
            )}
            
            <motion.div 
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <p className="text-sm text-gray-600">
                Don't have an account? Contact your administrator.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default StudentLoginForm;