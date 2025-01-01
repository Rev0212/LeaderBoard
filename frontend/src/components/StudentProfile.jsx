import React from 'react';
import { User, Mail, Hash, Star, Calendar, ArrowLeft } from 'lucide-react';

const StudentProfile = ({ studentData, handleBackToDashboard }) => {
  return (
    <div className="min-h-screen bg-white-100 flex flex-col items-center py-10">
      {/* Back Button */}
      <div className="w-full max-w-5xl px-6 mb-6">
        <button
          onClick={handleBackToDashboard}
          className="flex items-center gap-2 text-blue-500 hover:underline"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
      </div>

      {/* Profile Card */}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-5">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Student Profile</h1>
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full flex items-center gap-2">
            <Star size={20} />
            <span className="font-semibold text-lg">{studentData?.totalPoints || 0} Points</span>
          </div>
        </div>

        <div className="space-y-8">
          {/* Full Name */}
          <div className="flex items-center space-x-6">
            <div className="bg-gray-100 p-4 rounded-full">
              <User className="h-8 w-8 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="text-xl font-semibold text-gray-800">{studentData?.name || "N/A"}</p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center space-x-6">
            <div className="bg-gray-100 p-4 rounded-full">
              <Mail className="h-8 w-8 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Email Address</p>
              <p className="text-xl font-semibold text-gray-800">{studentData?.email || "N/A"}</p>
            </div>
          </div>

          {/* Register Number */}
          <div className="flex items-center space-x-6">
            <div className="bg-gray-100 p-4 rounded-full">
              <Hash className="h-8 w-8 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Register Number</p>
              <p className="text-xl font-semibold text-gray-800">{studentData?.registerNo || "N/A"}</p>
            </div>
          </div>

          {/* Events Participated */}
          <div className="flex items-center space-x-6">
            <div className="bg-gray-100 p-4 rounded-full">
              <Calendar className="h-8 w-8 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Events Participated</p>
              <p className="text-xl font-semibold text-gray-800">{studentData?.eventsParticipated?.length || 0}</p>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-10 pt-6 border-t border-gray-200 text-gray-500">
          <p className="text-md">
            Class ID: <span className="font-mono text-gray-700">{studentData?.class || "N/A"}</span>
          </p>
          <p className="text-md mt-2">
            Student ID: <span className="font-mono text-gray-700">{studentData?._id || "N/A"}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
