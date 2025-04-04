import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, 
  XAxis, YAxis, Tooltip, Cell, Legend, CartesianGrid, ResponsiveContainer 
} from "recharts";
import { 
  Trophy, Users, Calendar, Clock, AlertTriangle, 
  TrendingUp, Award, PieChart as PieChartIcon, BarChart2 
} from "lucide-react";
import { motion } from "framer-motion";

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;
const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const FacultyReportPage = () => {
  // State for report data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [reportData, setReportData] = useState({
    classOverview: null,
    departmentRanking: null,
    studentAnalysis: null,
    categoryAnalysis: null,
    participationTrends: null,
    engagementOpportunities: null
  });

  // Fetch reports on component mount
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token") || localStorage.getItem("teacher-token");
        
        if (!token) {
          throw new Error("Authentication token not found");
        }
        
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        };
        
        // Fetch all reports in parallel
        const [
          classOverviewRes,
          departmentRankingRes,
          studentAnalysisRes,
          categoryAnalysisRes,
          trendsRes,
          opportunitiesRes
        ] = await Promise.all([
          axios.get(`${VITE_BASE_URL}/faculty-reports/class-overview`, { headers }),
          axios.get(`${VITE_BASE_URL}/faculty-reports/department-ranking`, { headers }),
          axios.get(`${VITE_BASE_URL}/faculty-reports/student-analysis`, { headers }),
          axios.get(`${VITE_BASE_URL}/faculty-reports/category-analysis`, { headers }),
          axios.get(`${VITE_BASE_URL}/faculty-reports/participation-trends`, { headers }),
          axios.get(`${VITE_BASE_URL}/faculty-reports/engagement-opportunities`, { headers })
        ]);
        
        // Update state with response data
        setReportData({
          classOverview: classOverviewRes.data.data,
          departmentRanking: departmentRankingRes.data.data,
          studentAnalysis: studentAnalysisRes.data.data,
          categoryAnalysis: categoryAnalysisRes.data.data,
          participationTrends: trendsRes.data.data,
          engagementOpportunities: opportunitiesRes.data.data
        });
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching faculty reports:", err);
        setError(err.message || "Failed to load reports");
        setLoading(false);
      }
    };
    
    fetchReports();
  }, []);

  // Overview tab content
  const renderOverviewTab = () => {
    const { classOverview, departmentRanking } = reportData;
    
    if (!classOverview || !departmentRanking) return null;
    
    return (
      <div className="space-y-6">
        {/* Class Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard 
            title="Students" 
            value={classOverview.studentCount} 
            icon={<Users className="h-5 w-5 text-blue-500" />} 
            subtitle="Total Enrolled" 
          />
          <StatsCard 
            title="Class Rank" 
            value={`#${departmentRanking.facultyClass.rank}/${departmentRanking.facultyClass.outOf}`} 
            icon={<Trophy className="h-5 w-5 text-yellow-500" />} 
            subtitle="In Department" 
          />
          <StatsCard 
            title="Participation" 
            value={`${classOverview.participationRate}%`} 
            icon={<Calendar className="h-5 w-5 text-green-500" />} 
            subtitle="Active Students" 
          />
        </div>
        
        {/* Class vs Department */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Department Ranking</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={departmentRanking.departmentRankings}
                margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="className" angle={-45} textAnchor="end" height={70} />
                <YAxis label={{ value: 'Average Points', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [`${value} pts`, 'Average Points']} />
                <Bar
                  dataKey="averagePoints"
                  fill="#4F46E5"
                  isAnimationActive={true}
                  animationDuration={1000}
                >
                  {departmentRanking.departmentRankings.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={entry.classId === departmentRanking.facultyClass.classId ? '#10B981' : '#4F46E5'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  // Students tab content
  const renderStudentsTab = () => {
    const { studentAnalysis } = reportData;
    
    if (!studentAnalysis) return null;
    
    return (
      <div className="space-y-6">
        {/* Top Performers */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Top Performers</h3>
            <span className="text-sm text-gray-500">Your Class Stars</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Register No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activities</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {studentAnalysis.topPerformers.map((student, index) => (
                  <tr key={student._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.registerNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {student.totalPoints}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.activityCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Points Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Points Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={studentAnalysis.pointsDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    nameKey="range"
                    label={({range, percent}) => `${range} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {studentAnalysis.pointsDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} students`, name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* At-Risk Students */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">At-Risk Students</h3>
              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                Needs Attention
              </span>
            </div>
            
            {studentAnalysis.atRiskStudents.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {studentAnalysis.atRiskStudents.map(student => (
                  <div key={student._id} className="p-3 border rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{student.name}</p>
                      <p className="text-sm text-gray-500">{student.registerNo}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-red-600 font-medium">{student.inactiveDays} days inactive</p>
                      <p className="text-sm text-gray-500">{student.totalPoints} points total</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                No at-risk students found
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Categories tab content
  const renderCategoriesTab = () => {
    const { categoryAnalysis } = reportData;
    
    if (!categoryAnalysis) return null;
    
    return (
      <div className="space-y-6">
        {/* Popular Categories */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Popular Categories</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryAnalysis.popularCategories.slice(0, 8)}
                margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="category" type="category" width={150} />
                <Tooltip formatter={(value) => [`${value} submissions`, 'Count']} />
                <Legend />
                <Bar dataKey="count" name="Submissions" fill="#4F46E5" />
                <Bar dataKey="totalPoints" name="Points Earned" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Approval Rates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Category Success Rates</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryAnalysis.categorySuccessRates}
                  margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" angle={-45} textAnchor="end" height={70} />
                  <YAxis label={{ value: 'Approval Rate (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Approval Rate']} />
                  <Bar
                    dataKey="approvalRate"
                    fill="#10B981"
                    isAnimationActive={true}
                    animationDuration={1000}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Untapped Categories */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Untapped Categories</h3>
            {categoryAnalysis.untappedCategories.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {categoryAnalysis.untappedCategories.map(category => (
                  <div key={category.category} className="p-3 border rounded-lg flex items-center justify-between">
                    <p className="font-medium text-gray-900">{category.category}</p>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {category.count === 0 
                          ? 'No participation' 
                          : `${category.count} submissions`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                No untapped categories found
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Trends tab content
  const renderTrendsTab = () => {
    const { participationTrends } = reportData;
    
    if (!participationTrends) return null;
    
    return (
      <div className="space-y-6">
        {/* Monthly Trends */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Participation Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={participationTrends}
                margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="displayDate" angle={-45} textAnchor="end" height={70} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="submissions"
                  name="Submissions"
                  stroke="#4F46E5"
                  activeDot={{ r: 8 }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="approvals"
                  name="Approvals"
                  stroke="#10B981"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="points"
                  name="Points Earned"
                  stroke="#F59E0B"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  // Opportunities tab content
  const renderOpportunitiesTab = () => {
    const { engagementOpportunities } = reportData;
    
    if (!engagementOpportunities) return null;
    
    return (
      <div className="space-y-6">
        {/* Suggested Categories */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Suggested Categories for Improvement</h3>
            <span className="text-sm text-gray-500">Low Participation Areas</span>
          </div>
          
          {engagementOpportunities.suggestedCategories.length > 0 ? (
            <div className="space-y-3">
              {engagementOpportunities.suggestedCategories.map(category => (
                <div key={category.category} className="p-3 border rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{category.category}</p>
                    <p className="text-sm text-gray-500">
                      {category.uniqueStudents} students participated
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-blue-600">{category.participationRate}% participation</p>
                    <p className="text-sm text-gray-500">{category.count} submissions total</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              No suggested categories available
            </div>
          )}
        </div>
        
        {/* Recognition Opportunities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Top Achievers</h3>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                Recognition Worthy
              </span>
            </div>
            
            {engagementOpportunities.recognitionOpportunities.topAchievers.length > 0 ? (
              <div className="space-y-3">
                {engagementOpportunities.recognitionOpportunities.topAchievers.map(student => (
                  <div key={student._id} className="p-3 border rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{student.name}</p>
                      <p className="text-sm text-gray-500">{student.registerNo}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">{student.totalPoints} points</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                No top achievers data available
              </div>
            )}
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Most Improved</h3>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                Recent Progress
              </span>
            </div>
            
            {engagementOpportunities.recognitionOpportunities.improvedStudents.length > 0 ? (
              <div className="space-y-3">
                {engagementOpportunities.recognitionOpportunities.improvedStudents.map(student => (
                  <div key={student._id} className="p-3 border rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{student.name}</p>
                      <p className="text-sm text-gray-500">{student.registerNo}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">+{student.recentPoints} points</p>
                      <p className="text-sm text-gray-500">{student.recentActivities} recent activities</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                No improved students data available
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Helper component for stat cards
  const StatsCard = ({ title, value, icon, subtitle }) => (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-gray-700">{title}</h3>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
    </div>
  );

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Error loading faculty reports: {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="bg-gray-50 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Faculty Report</h1>
        <p className="text-gray-600">
          {reportData.classOverview && 
            `${reportData.classOverview.className} • ${reportData.classOverview.department}`}
        </p>
      </div>
      
      {/* Tab Navigation */}
      <div className="mb-6 border-b">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-4 px-2 font-medium text-sm ${
              activeTab === "overview"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center">
              <Trophy className="h-4 w-4 mr-2" />
              Overview
            </div>
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`pb-4 px-2 font-medium text-sm ${
              activeTab === "students"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Students
            </div>
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`pb-4 px-2 font-medium text-sm ${
              activeTab === "categories"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center">
              <PieChartIcon className="h-4 w-4 mr-2" />
              Categories
            </div>
          </button>
          <button
            onClick={() => setActiveTab("trends")}
            className={`pb-4 px-2 font-medium text-sm ${
              activeTab === "trends"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Trends
            </div>
          </button>
          <button
            onClick={() => setActiveTab("opportunities")}
            className={`pb-4 px-2 font-medium text-sm ${
              activeTab === "opportunities"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center">
              <Award className="h-4 w-4 mr-2" />
              Opportunities
            </div>
          </button>
        </nav>
      </div>
      
      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === "overview" && renderOverviewTab()}
        {activeTab === "students" && renderStudentsTab()}
        {activeTab === "categories" && renderCategoriesTab()}
        {activeTab === "trends" && renderTrendsTab()}
        {activeTab === "opportunities" && renderOpportunitiesTab()}
      </motion.div>
    </div>
  );
};

export default FacultyReportPage;