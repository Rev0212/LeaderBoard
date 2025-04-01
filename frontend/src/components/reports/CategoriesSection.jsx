import React, { useState, useMemo } from 'react';
import { 
  PieChart, Pie, BarChart, Bar, 
  XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend, CartesianGrid 
} from 'recharts';

const CategoriesSection = ({ popularCategories, categoryPerformanceByClass }) => {
  // Ensure we're working with an array
  const performanceData = Array.isArray(categoryPerformanceByClass) 
    ? categoryPerformanceByClass 
    : [];
  
  // Extract unique class names from the data
  const classNames = useMemo(() => {
    return ['All', ...new Set(performanceData.map(item => item.className))];
  }, [performanceData]);
  
  const [selectedClass, setSelectedClass] = useState('All');
  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  
  // Transform the data for the chart based on selected class
  const chartData = useMemo(() => {
    // If no data or class selected is 'All', return empty array
    if (performanceData.length === 0) return [];
    
    if (selectedClass === 'All') {
      // Combine all categories across classes
      const allCategories = {};
      
      performanceData.forEach(classData => {
        if (classData.categories && Array.isArray(classData.categories)) {
          classData.categories.forEach(catData => {
            const category = catData.category;
            if (!allCategories[category]) {
              allCategories[category] = { points: 0, count: 0 };
            }
            allCategories[category].points += catData.points || 0;
            allCategories[category].count += catData.count || 0;
          });
        }
      });
      
      // Convert to array format for chart
      return Object.keys(allCategories).map(category => ({
        category,
        score: allCategories[category].points,
        count: allCategories[category].count
      }));
    } else {
      // Find the selected class
      const classData = performanceData.find(cls => cls.className === selectedClass);
      
      // If class found and has categories, transform to expected format
      if (classData && classData.categories && Array.isArray(classData.categories)) {
        return classData.categories.map(catData => ({
          category: catData.category,
          score: catData.points || 0,
          count: catData.count || 0
        }));
      }
      
      return [];
    }
  }, [performanceData, selectedClass]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Categories Analysis</h2>
      
      {/* Popular Categories Pie Chart */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">Most Popular Categories</h3>
        {popularCategories.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={popularCategories}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="count"
                nameKey="category"
                label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
              >
                {popularCategories.map((entry, index) => (
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
      
      {/* Category Performance by Class */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Category Performance by Class</h3>
          
          {/* Class Filter */}
          <select
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            {classNames.map(className => (
              <option key={className} value={className}>{className}</option>
            ))}
          </select>
        </div>
        
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="score" fill="#4F46E5" name="Points" />
              <Bar dataKey="count" fill="#10B981" name="Activity Count" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex justify-center items-center h-64 text-gray-500">
            No data available for the selected class
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesSection;