import React, { useState } from 'react';
import { Search, Calendar, X } from 'lucide-react';

const StudentsSection = ({ detailedStudentPerformance, inactiveStudents, availableClasses }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [inactiveDaysFilter, setInactiveDaysFilter] = useState(30);

  // Filter detailed student performance based on search and class
  const filteredStudentPerformance = detailedStudentPerformance
    .filter(student => 
      (selectedClass === 'All' || student.className === selectedClass) &&
      (student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
       student.registerNo.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => b.totalPoints - a.totalPoints);

  // Filter inactive students
  const filteredInactiveStudents = inactiveStudents
    .filter(student => 
      (selectedClass === 'All' || student.className === selectedClass) &&
      (student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
       student.registerNo.toLowerCase().includes(searchQuery.toLowerCase())) &&
      student.inactiveDays >= inactiveDaysFilter
    );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Student Analysis</h2>
      
      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name or register number..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          
          {/* Class Filter */}
          <div className="md:w-48">
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="All">All Classes</option>
              {availableClasses.map(classInfo => (
                <option key={classInfo.className} value={classInfo.className}>
                  {classInfo.className}
                </option>
              ))}
            </select>
          </div>
          
          {/* Inactive Days Filter */}
          <div className="md:w-64">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">Inactive for at least</span>
              <select
                value={inactiveDaysFilter}
                onChange={e => setInactiveDaysFilter(Number(e.target.value))}
                className="block px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={7}>7 days</option>
                <option value={15}>15 days</option>
                <option value={30}>30 days</option>
                <option value={60}>60 days</option>
                <option value={90}>90 days</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Student Performance Table */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">Top Performing Students</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Register No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activities</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudentPerformance.length > 0 ? (
                filteredStudentPerformance.map((student, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.registerNo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.className}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{student.totalPoints}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.activityCount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No student data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Inactive Students Table */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Inactive Students</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Register No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inactive Days</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInactiveStudents.length > 0 ? (
                filteredInactiveStudents.map((student, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.registerNo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.className}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.lastActivity ? new Date(student.lastActivity).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-orange-600">
                      {student.inactiveDays} days
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No inactive students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentsSection;