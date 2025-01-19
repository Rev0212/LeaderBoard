import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, 
  Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell
} from 'recharts';
import { ArrowLeft, Download, LogOut, Search } from 'react-feather';
import { useAuth } from '../context/AuthContext';

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AdvisorDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('monthly');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Add new state for category performance and inactive students
  const [categoryByClass, setCategoryByClass] = useState([]);
  const [inactiveStudents, setInactiveStudents] = useState([]);
  const [nameSearchQuery, setNameSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [inactiveDaysFilter, setInactiveDaysFilter] = useState(30);
  const [uniqueClasses, setUniqueClasses] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [filterType]);

  useEffect(() => {
    if (dashboardData?.inactiveStudents) {
      // Extract unique classes from inactive students data
      const classes = [...new Set(dashboardData.inactiveStudents.map(student => student.className))].sort();
      setUniqueClasses(classes);
    }
  }, [dashboardData]);

  const fetchDashboardData = async () => {
    try {
      const savedUser = localStorage.getItem('advisor-user');
      const userData = savedUser ? JSON.parse(savedUser) : null;
      
      if (!userData?.token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `${VITE_BASE_URL}/api/advisor/dashboard-reports?filterType=${filterType}`,
        {
          headers: {
            'Authorization': `Bearer ${userData.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      setError(error.message);
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (reportType) => {
    try {
      const savedUser = localStorage.getItem('advisor-user');
      const userData = savedUser ? JSON.parse(savedUser) : null;
      
      const response = await fetch(
        `${VITE_BASE_URL}/api/advisor/download-report/${reportType}?filterType=${filterType}`,
        {
          headers: {
            'Authorization': `Bearer ${userData.token}`
          }
        }
      );
      
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-report.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Error downloading report');
    }
  };

  // Filter inactive students
  const filteredInactiveStudents = dashboardData?.inactiveStudents?.filter(student => {
    const matchesName = student.name.toLowerCase().includes(nameSearchQuery.toLowerCase());
    const matchesClass = !selectedClass || student.className === selectedClass;
    const lastActivity = student.lastActivity ? new Date(student.lastActivity) : null;
    const inactiveDays = lastActivity 
      ? Math.floor((new Date() - lastActivity) / (1000 * 60 * 60 * 24))
      : Number.POSITIVE_INFINITY;
    return matchesName && matchesClass && inactiveDays >= inactiveDaysFilter;
  }) || [];

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (error) return <div className="flex items-center justify-center min-h-screen text-red-600">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Academic Advisor Dashboard</h1>
          <div className="flex gap-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-lg border-gray-300"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Download size={20} />
              Download Report
            </button>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
              Back
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Class Performance</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData.classPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="totalPoints" fill="#4F46E5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Popular Categories</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.popularCategories}
                    dataKey="count"
                    nameKey="_id"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {dashboardData.popularCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Performance by Class */}
          <div className="bg-white p-6 rounded-lg shadow col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Category Performance by Class</h2>
              <button
                onClick={() => handleDownloadReport('category-performance')}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                <Download size={16} />
                Download
              </button>
            </div>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData.categoryPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="className" />
                  <YAxis />
                  <Tooltip />
                  {Object.keys(dashboardData.categoryPerformance[0] || {})
                    .filter(key => key !== 'className')
                    .map((category, index) => (
                      <Bar 
                        key={category} 
                        dataKey={category} 
                        fill={COLORS[index % COLORS.length]} 
                        stackId="a"
                      />
                    ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Inactive Students Section */}
          <div className="bg-white p-6 rounded-lg shadow col-span-2">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Inactive Students</h2>
            
            {/* Filters Section */}
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Student Name Search */}
              <div className="w-full">
                <label htmlFor="nameSearch" className="block text-sm font-medium text-gray-700 mb-1">
                  Search by Student Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="nameSearch"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10"
                    placeholder="Enter student name..."
                    value={nameSearchQuery}
                    onChange={(e) => setNameSearchQuery(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Class Filter Dropdown */}
              <div className="w-full">
                <label htmlFor="classFilter" className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Class
                </label>
                <select
                  id="classFilter"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="">All Classes</option>
                  {uniqueClasses.map((className) => (
                    <option key={className} value={className}>
                      {className}
                    </option>
                  ))}
                </select>
              </div>

              {/* Inactive Days Filter */}
              <div className="w-full">
                <label htmlFor="inactiveDays" className="block text-sm font-medium text-gray-700 mb-1">
                  Inactive For At Least
                </label>
                <select
                  id="inactiveDays"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10"
                  value={inactiveDaysFilter}
                  onChange={(e) => setInactiveDaysFilter(Number(e.target.value))}
                >
                  <option value={7}>7 days</option>
                  <option value={14}>14 days</option>
                  <option value={30}>30 days</option>
                  <option value={60}>60 days</option>
                  <option value={90}>90 days</option>
                </select>
              </div>
            </div>

            {/* Results count */}
            <div className="text-sm text-gray-500 mb-4">
              Found {filteredInactiveStudents.length} inactive students
              {(nameSearchQuery || selectedClass || inactiveDaysFilter !== 30) && (
                <button
                  onClick={() => {
                    setNameSearchQuery('');
                    setSelectedClass('');
                    setInactiveDaysFilter(30);
                  }}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* Inactive Students Table */}
            <div className="overflow-x-auto">
              <div className="max-h-[400px] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 w-1/4">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 w-1/4">
                        Class
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 w-1/4">
                        Last Activity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 w-1/4">
                        Inactive Days
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredInactiveStudents.map((student, index) => {
                      const lastActivity = student.lastActivity ? new Date(student.lastActivity) : null;
                      const inactiveDays = lastActivity 
                        ? Math.floor((new Date() - lastActivity) / (1000 * 60 * 60 * 24))
                        : 'N/A';
                      
                      return (
                        <tr key={student._id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {student.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.className}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {lastActivity ? lastActivity.toLocaleDateString() : 'Never'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {inactiveDays !== 'N/A' ? `${inactiveDays} days` : 'N/A'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvisorDashboard; 