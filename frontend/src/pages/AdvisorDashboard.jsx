import React from 'react';
import ReportsPage from './ReportsPage';
import { useAuth } from '../context/AuthContext';

const AdvisorDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
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