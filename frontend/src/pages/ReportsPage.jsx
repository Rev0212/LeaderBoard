import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, 
  XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend, CartesianGrid
} from 'recharts';
import { 
  TrendingUp, Award, PieChart as PieChartIcon, 
  BarChart2, Users, Download, Search
} from 'lucide-react';

import LeaderboardTable from '../components/LeaderBoard';
import ReportsDownloadSection from '../components/ReportsDownloadSection';

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
  const [activeSection, setActiveSection] = useState('overview');
  const [inactiveStudents, setInactiveStudents] = useState([]);
  const [classParticipation, setClassParticipation] = useState([]);
  const [nameSearchQuery, setNameSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [inactiveDaysFilter, setInactiveDaysFilter] = useState(30);

  const baseURL = import.meta.env.VITE_BASE_URL;

  // Color schemes for charts
  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  // Sidebar navigation items
  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: <TrendingUp size={20} /> },
    { id: 'performance', label: 'Performance', icon: <Award size={20} /> },
    { id: 'categories', label: 'Categories', icon: <PieChartIcon size={20} /> },
    { id: 'class-analysis', label: 'Class Analysis', icon: <BarChart2 size={20} /> },
    { id: 'students', label: 'Students', icon: <Users size={20} /> },
    { id: 'downloads', label: 'Downloads', icon: <Download size={20} /> }
  ];

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

        // Fetch inactive students
        const inactiveStudentsResponse = await axios.get(`${baseURL}/reports/inactive-students`);
        setInactiveStudents(inactiveStudentsResponse.data.inactiveStudents || []);

        // Fetch class participation data
        const classParticipationResponse = await axios.get(`${baseURL}/reports/class-participation`);
        setClassParticipation(classParticipationResponse.data.participation || []);

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

  const formatDataForChart = (data) => {
    if (!data || data.length === 0) return [];
    
    // Get unique categories across all classes
    const allCategories = [...new Set(
      data.flatMap(item => item.categories.map(cat => cat.category))
    )];

    // Format data for the chart
    return data.map(classData => {
      const formattedData = {
        className: classData.className,
        totalPoints: classData.totalPoints,
      };

      // Add each category's points
      allCategories.forEach(category => {
        const categoryData = classData.categories.find(cat => cat.category === category);
        formattedData[category] = categoryData ? categoryData.points : 0;
      });

      return formattedData;
    });
  };

  const filteredInactiveStudents = inactiveStudents.filter(student => {
    const matchesName = student.name.toLowerCase().includes(nameSearchQuery.toLowerCase());
    const matchesClass = !selectedClass || student.className === selectedClass;
    
    const lastActivity = student.lastActivity ? new Date(student.lastActivity) : null;
    const inactiveDays = lastActivity 
      ? Math.floor((new Date() - lastActivity) / (1000 * 60 * 60 * 24))
      : Number.POSITIVE_INFINITY;

    return matchesName && matchesClass && inactiveDays >= inactiveDaysFilter;
  });

  const uniqueClasses = [...new Set(inactiveStudents.map(student => student.className))].sort();

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Total Prize Money</h2>
              <span className="text-3xl font-bold text-green-600">
                ₹{totalPrizeMoney.toLocaleString()}
              </span>
            </div>
            
            <div className="bg-white rounded-lg shadow">
              <LeaderboardTable />
            </div>
          </div>
        );

      case 'performance':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Class Performance</h2>
              <div className="h-80">
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

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Student Performance</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={studentPerformance}>
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="totalPoints" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );

      case 'categories':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Popular Categories</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={popularCategories}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
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

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Category Performance by Class</h2>
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
        );

      case 'class-analysis':
        return (
          <div className="space-y-8">
            {/* Class Performance Overview */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Class Performance Overview</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={classPerformance}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="_id" 
                      label={{ value: 'Class', position: 'bottom', offset: 0 }}
                    />
                    <YAxis label={{ value: 'Total Points', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Bar dataKey="totalPoints" fill="#4F46E5" name="Total Points" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Performance by Class */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Category Performance by Class</h2>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={formatDataForChart(classParticipation)}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      type="category" 
                      dataKey="className" 
                      width={100}
                    />
                    <Tooltip />
                    <Legend />
                    {Object.keys(formatDataForChart(classParticipation)[0] || {})
                      .filter(key => !['className', 'totalPoints'].includes(key))
                      .map((category, index) => (
                        <Bar 
                          key={category}
                          dataKey={category}
                          fill={COLORS[index % COLORS.length]}
                          name={category}
                          stackId="a"
                        />
                      ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Class Participation Trends */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Class Participation Rate</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={classParticipation.map(item => ({
                        name: item.className,
                        value: item.categories.reduce((sum, cat) => sum + cat.participationCount, 0)
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {classParticipation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => {
                        const total = classParticipation.reduce((sum, item) => 
                          sum + item.categories.reduce((catSum, cat) => catSum + cat.participationCount, 0), 0
                        );
                        const percentage = ((value / total) * 100).toFixed(1);
                        return [`${percentage}% (${value} participations)`, name];
                      }}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Inactive Students Table */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Inactive Students</h2>
              
              {/* Filters Section */}
              <div className="mb-4 flex flex-wrap gap-4">
                {/* Student Name Search */}
                <div className="flex-1 min-w-[200px]">
                  <label htmlFor="nameSearch" className="block text-sm font-medium text-gray-700 mb-1">
                    Search by Student Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="nameSearch"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
                <div className="flex-1 min-w-[200px]">
                  <label htmlFor="classFilter" className="block text-sm font-medium text-gray-700 mb-1">
                    Filter by Class
                  </label>
                  <select
                    id="classFilter"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
                <div className="flex-1 min-w-[200px]">
                  <label htmlFor="inactiveDays" className="block text-sm font-medium text-gray-700 mb-1">
                    Inactive For At Least
                  </label>
                  <select
                    id="inactiveDays"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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

              <div className="overflow-x-auto">
                <div className="max-h-[400px] overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                          Class
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                          Last Activity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
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
                          <tr key={student._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
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
        );

      case 'downloads':
        return <ReportsDownloadSection baseURL={baseURL} />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg fixed h-full">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-800 mb-6">Reports Dashboard</h1>
          <nav className="space-y-2">
            {sidebarItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeSection === item.id 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 p-8">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-lg text-gray-600">Loading reports...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-lg text-red-600">{error}</div>
          </div>
        ) : (
          renderContent()
        )}
      </div>
    </div>
  );
};

export default ReportsPage;