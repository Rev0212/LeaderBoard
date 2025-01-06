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

const ReportsPage = () => {
  const [totalPrizeMoney, setTotalPrizeMoney] = useState(0);
  const [topStudents, setTopStudents] = useState([]);
  const [popularCategories, setPopularCategories] = useState([]);
  const [approvalRates, setApprovalRates] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const baseURL = import.meta.env.VITE_BASE_URL;

  // Color schemes for charts
  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
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

      } catch (err) {
        setError('Failed to load report data');
        console.error('Error fetching data:', err);
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

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Top Students Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Top Students</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topStudents} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="submittedBy" tick={{ fill: '#4B5563' }} />
                  <YAxis tick={{ fill: '#4B5563' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="totalPoints" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

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

          {/* Approval Rates Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Approval Rates</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={approvalRates}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    labelLine={false}
                    label={renderCustomizedLabel}
                  >
                    {approvalRates.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trends Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Event Trends</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="year" tick={{ fill: '#4B5563' }} />
                  <YAxis tick={{ fill: '#4B5563' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#4F46E5"
                    strokeWidth={2}
                    dot={{ fill: '#4F46E5' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;