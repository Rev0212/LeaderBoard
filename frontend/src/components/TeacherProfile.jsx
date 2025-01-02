import React from 'react';
import { User, Mail, Hash, Star, Calendar, ArrowLeft } from 'lucide-react';

const TeacherProfile = ({ teacherData, handleBackToDashboard }) => {
  return (
    <div className="max-w-2xl mt-10 mx-auto p-6">
      <button
        onClick={handleBackToDashboard}
        className="flex items-center gap-2 text-blue-500 hover:underline mb-6"
      >
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Teacher Profile</h1>
        </div>

        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="bg-gray-100 p-3 rounded-full">
              <User className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="text-lg font-semibold">{teacherData?.name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="bg-gray-100 p-3 rounded-full">
              <Mail className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Email Address</p>
              <p className="text-lg font-semibold">{teacherData?.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="bg-gray-100 p-3 rounded-full">
              <Hash className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Register Number</p>
              <p className="text-lg font-semibold">{teacherData?.registerNo}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="bg-gray-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Class Incharge:</p>
              <p className="text-lg font-semibold">{teacherData?.classes[0].className}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Teacher ID: <span className="font-mono">{teacherData?._id}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;
