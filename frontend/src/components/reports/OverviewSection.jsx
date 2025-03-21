import React from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, 
  XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend, CartesianGrid
} from 'recharts';

const OverviewSection = ({ topStudents, approvalRates, trends, prizeMoneyByClass, role }) => {
  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Overview Dashboard</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Students Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Top Performing Students</h3>
          {topStudents.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topStudents.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="score" fill="#4F46E5" name="Points" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex justify-center items-center h-64 text-gray-500">
              No data available
            </div>
          )}
        </div>
        
        {/* Approval Rates Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Activity Approval Rates</h3>
          {approvalRates.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={approvalRates}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {approvalRates.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex justify-center items-center h-64 text-gray-500">
              No data available
            </div>
          )}
        </div>
      </div>
      
      {/* Trends Chart - Full Width */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">Activity Submission Trends</h3>
        {trends.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="submissions" stroke="#4F46E5" name="Submissions" />
              <Line type="monotone" dataKey="approvals" stroke="#10B981" name="Approvals" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex justify-center items-center h-64 text-gray-500">
            No data available
          </div>
        )}
      </div>
      
      {/* HOD Only: Prize Money by Class */}
      {(role === 'HOD' || role === 'admin') && prizeMoneyByClass.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold mb-4">Prize Money Distribution by Class</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={prizeMoneyByClass}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="className" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalPrizeMoney" fill="#8B5CF6" name="Total Prize Money" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default OverviewSection;