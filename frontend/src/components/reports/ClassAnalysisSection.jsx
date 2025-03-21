import React, { useState } from 'react';
import { 
  BarChart, Bar, LineChart, Line, 
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid 
} from 'recharts';

const ClassAnalysisSection = ({ classPerformance, classParticipation, availableClasses }) => {
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  
  // Filter class performance data by department
  const filteredPerformance = selectedDepartment === 'All' 
    ? classPerformance 
    : classPerformance.filter(cls => cls.department === selectedDepartment);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Class Analysis</h2>
      
      
      
      {/* Class Performance Bar Chart */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">Class Performance Comparison</h3>
        {filteredPerformance.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart 
              data={filteredPerformance}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="className" 
                angle={-45}
                textAnchor="end"
                height={70}
                interval={0}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalPoints" fill="#4F46E5" name="Total Points" />
              <Bar dataKey="studentCount" fill="#10B981" name="Student Count" />
              <Bar dataKey="totalActivities" fill="#F59E0B" name="Activity Count" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex justify-center items-center h-64 text-gray-500">
            No data available
          </div>
        )}
      </div>
      
      {/* Class Activities Summary */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Class Activity Summary</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activities</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Points</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPerformance.length > 0 ? (
                filteredPerformance.map((cls, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cls.className}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.studentCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.totalActivities}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {cls.averagePoints?.toFixed(1) || '0'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No class data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Class Participation Line Chart */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Class Participation Trends</h3>
        {classParticipation.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={classParticipation}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              {availableClasses.map((classInfo, index) => (
                <Line 
                  key={classInfo.className}
                  type="monotone" 
                  dataKey={classInfo.className} 
                  stroke={`hsl(${index * 60}, 70%, 50%)`} 
                  name={classInfo.className}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex justify-center items-center h-64 text-gray-500">
            No data available
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassAnalysisSection;