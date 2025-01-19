import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, 
  Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { ArrowLeft, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

const AdvisorDashboard = () => {
  const [classData, setClassData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchClassData();
  }, []);

  const fetchClassData = async () => {
    try {
      const response = await fetch(`${VITE_BASE_URL}/api/advisor/reports`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const data = await response.json();
      setClassData(data.classes);
      setUserRole(user?.role || '');
    } catch (error) {
      setError(error.message);
      console.error('Error fetching class data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${VITE_BASE_URL}/api/advisor/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      logout();
      navigate('/advisor/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const renderClassPerformance = () => {
    return classData.map((classInfo) => (
      <div key={classInfo._id} className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">{classInfo.className}</h2>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={classInfo.students}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalPoints" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Class Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Average Points</p>
              <p className="text-xl font-semibold">
                {Math.round(
                  classInfo.students.reduce((acc, student) => acc + student.totalPoints, 0) / 
                  classInfo.students.length
                )}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-xl font-semibold">{classInfo.students.length}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Active Students</p>
              <p className="text-xl font-semibold">
                {classInfo.students.filter(student => student.eventsParticipated.length > 0).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    ));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {userRole === 'hod' ? 'HOD Dashboard' : 'Academic Advisor Dashboard'}
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            Back
          </button>
        </div>

        {renderClassPerformance()}
      </div>
    </div>
  );
};

export default AdvisorDashboard; 