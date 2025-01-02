import React from 'react';
import { User, Mail, Hash, Star, Calendar, ArrowLeft } from 'lucide-react';

const StudentProfile = ({ studentData, handleBackToDashboard }) => {
  return (
    <div className="max-w-2xl mt-20 mx-auto p-6">
      <button
        onClick={handleBackToDashboard}
        className="flex items-center gap-2 text-blue-500 hover:underline mb-6"
      >
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Student Profile</h1>
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
            <div className="flex items-center space-x-2">
              <Star size={20} />
              <span className="font-semibold">{studentData?.totalPoints} Points</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="bg-gray-100 p-3 rounded-full">
              <User className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="text-lg font-semibold">{studentData?.name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="bg-gray-100 p-3 rounded-full">
              <Mail className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Email Address</p>
              <p className="text-lg font-semibold">{studentData?.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="bg-gray-100 p-3 rounded-full">
              <Hash className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Register Number</p>
              <p className="text-lg font-semibold">{studentData?.registerNo}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="bg-gray-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Events Participated</p>
              <p className="text-lg font-semibold">{studentData?.eventsParticipated?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Class ID: <span className="font-mono">{studentData?.class}</span>
          </p>
          <p className="text-sm text-gray-500">
            Student ID: <span className="font-mono">{studentData?._id}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;