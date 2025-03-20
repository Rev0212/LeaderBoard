import React from 'react';
import { 
  BarChart, Bar, LineChart, Line, 
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid 
} from 'recharts';

const ClassAnalysisSection = ({ classPerformance, classParticipation, availableClasses }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Class Analysis</h2>
      
      {/* Class Performance Bar Chart */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">Class Performance Comparison</h3>
        {classPerformance.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={classPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="className" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="averageScore" fill="#4F46E5" name="Average Score" />
              <Bar dataKey="totalActivities" fill="#10B981" name="Total Activities" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex justify-center items-center h-64 text-gray-500">
            No data available
          </div>
        )}
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