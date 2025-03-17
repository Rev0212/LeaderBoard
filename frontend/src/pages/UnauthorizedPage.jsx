import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="flex items-center justify-center mb-6">
          <AlertTriangle className="text-red-500 h-16 w-16" />
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Access Denied
        </h1>
        <p className="text-gray-600 text-center mb-6">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        <div className="flex justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;