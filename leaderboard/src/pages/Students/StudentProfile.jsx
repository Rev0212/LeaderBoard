import React, { useState, useEffect } from 'react';
import { User, Mail, Hash, Star, Calendar } from 'lucide-react';


const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

const StudentProfile = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const response = await fetch(`${VITE_BASE_URL}/student/profile`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('student-token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch student data');
        }

        const data = await response.json();
        setStudent(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mt-20 mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Student Profile</h1>
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
            <div className="flex items-center space-x-2">
              <Star size={20} />
              <span className="font-semibold">{student?.totalPoints} Points</span>
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
              <p className="text-lg font-semibold">{student?.name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="bg-gray-100 p-3 rounded-full">
              <Mail className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Email Address</p>
              <p className="text-lg font-semibold">{student?.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="bg-gray-100 p-3 rounded-full">
              <Hash className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Register Number</p>
              <p className="text-lg font-semibold">{student?.registerNo}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="bg-gray-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Events Participated</p>
              <p className="text-lg font-semibold">{student?.eventsParticipated?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Class ID: <span className="font-mono">{student?.class}</span>
          </p>
          <p className="text-sm text-gray-500">
            Student ID: <span className="font-mono">{student?._id}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;