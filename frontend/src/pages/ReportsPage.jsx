import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, 
  LineChart, Line,
  PieChart, Pie, 
  XAxis, YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts';

import LeaderboardTable from '../components/LeaderBoard';

const ReportsPage = () => {
  const [totalPrizeMoney, setTotalPrizeMoney] = useState(0);
  const [topStudents, setTopStudents] = useState([]);
  const [popularCategories, setPopularCategories] = useState([]);
  const [approvalRates, setApprovalRates] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classPerformance, setClassPerformance] = useState([]);
  const [studentPerformance, setStudentPerformance] = useState([]);
  const [categoryByClass, setCategoryByClass] = useState([]);

  const baseURL = import.meta.env.VITE_BASE_URL;

  // Color schemes for charts
  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error state
        
        // Fetch prize money
        const prizeMoneyResponse = await axios.get(`${baseURL}/reports/total-prize-money`);
        setTotalPrizeMoney(prizeMoneyResponse.data.totalPrizeMoney);

        // Fetch top students
        const topStudentsResponse = await axios.get(`${baseURL}/reports/top-students`);
        const formattedStudentData = topStudentsResponse.data.topStudents.map(student => ({
          submittedBy: student._id,
          totalPoints: student.totalPoints,
        }));
        setTopStudents(formattedStudentData);

        // Fetch and format categories
        const categoriesResponse = await axios.get(`${baseURL}/reports/popular-categories`);
        const formattedCategories = categoriesResponse.data.popularCategories.map(category => ({
          name: category._id,
          value: category.count
        }));
        setPopularCategories(formattedCategories);

        // Fetch approval rates
        const approvalResponse = await axios.get(`${baseURL}/reports/approval-rates`);
        const formattedApprovalRates = approvalResponse.data.approvalRates.map(rate => ({
          name: rate.status,
          value: rate.count
        }));
        setApprovalRates(formattedApprovalRates);

        // Fetch trends
        const trendsResponse = await axios.get(`${baseURL}/reports/trends/monthly`);
        setTrends(trendsResponse.data.trends);

        // Fetch class performance
        const classPerformanceResponse = await axios.get(`${baseURL}/reports/class-performance`);
        console.log('Class Performance Response:', classPerformanceResponse.data); // Add logging
        setClassPerformance(classPerformanceResponse.data.performance || []);

        // Fetch detailed student performance
        const studentPerformanceResponse = await axios.get(`${baseURL}/reports/detailed-student-performance`);
        console.log('Student Performance Response:', studentPerformanceResponse.data); // Add logging
        setStudentPerformance(studentPerformanceResponse.data.performance || []);

        // Fetch category performance by class
        const categoryResponse = await axios.get(`${baseURL}/reports/category-performance-by-class`);
        console.log('Category Performance Response:', categoryResponse.data); // Add logging
        setCategoryByClass(categoryResponse.data.performance || []);

      } catch (err) {
        console.error('Error details:', err.response?.data || err.message); // Add detailed error logging
        setError(err.response?.data?.message || 'Failed to load report data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [baseURL]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
          <p className="text-gray-600">
            {label ? `${label}: ${payload[0].value}` : `${payload[0].name}: ${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
      >
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading reports...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Event Reports</h1>
        
        {/* Prize Money Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-700">Total Prize Money</h2>
            <span className="text-3xl font-bold text-green-600">
            ₹{totalPrizeMoney.toLocaleString()}
            </span>
          </div>
        </div>

        <div className='h-30 mb-8 bg-white rounded-lg shadow'>
          <LeaderboardTable />
        </div>

on        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Popular Categories Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Popular Categories</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={popularCategories}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    labelLine={false}
                    label={renderCustomizedLabel}
                  >
                    {popularCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

  
          <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Class Performance</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classPerformance}>
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="totalPoints" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        </div>


        {/* Category by Class Performance */}
        <div className="bg-white rounded-lg shadow p-8 mt-5 mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Category Performance by Class</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Points
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categories Performance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categoryByClass.map((classData, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {classData.className || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {classData.totalPoints}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {classData.categories.map((cat, idx) => (
                        <div key={idx} className="mb-2">
                          <span className="font-medium">{cat.category}:</span>{' '}
                          {cat.points} points{' '}
                          <span className="text-gray-400">
                            ({cat.participationCount} participation{cat.participationCount !== 1 ? 's' : ''})
                          </span>
                        </div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
      </div>
  );
};

export default ReportsPage;