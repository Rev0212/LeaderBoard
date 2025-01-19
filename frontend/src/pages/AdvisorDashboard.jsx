import React from 'react';
import ReportsPage from './ReportsPage';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdvisorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const baseURL = import.meta.env.VITE_BASE_URL;

  const handleLogout = async () => {
    try {
      // Get token with correct key
      const token = localStorage.getItem('advisorToken');
      
      // Add withCredentials for cookie handling
      await axios.post(`${baseURL}/api/advisor/logout`, null, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      // Clear all advisor-related storage
      localStorage.removeItem('advisorToken');
      localStorage.removeItem('advisor-user');
      
      // Use auth context logout
      logout();
      
      // Navigate to login
      navigate('/advisor/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Add fallback logout even if API call fails
      localStorage.removeItem('advisorToken');
      localStorage.removeItem('advisor-user');
      logout();
      navigate('/advisor/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Logout Button - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>

      {/* Reports Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-6">Academic Advisor Dashboard</h1>
        <ReportsPage 
          isAdvisor={true} 
          advisorId={user._id}
          visibleSections={['categories', 'class-analysis', 'students']} 
        />
      </div>
    </div>
  );
};

export default AdvisorDashboard; 