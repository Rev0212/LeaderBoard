import React, { useState } from 'react';
import { Search, Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react';

const StudentsSection = ({ detailedStudentPerformance, inactiveStudents, availableClasses }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [inactiveDaysFilter, setInactiveDaysFilter] = useState(30);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage, setStudentsPerPage] = useState(10);

  // Filter detailed student performance based on search and class
  const filteredStudentPerformance = detailedStudentPerformance
    .filter(student => 
      (selectedClass === 'All' || student.className === selectedClass) &&
      (student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
       student.registerNo.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => b.totalPoints - a.totalPoints);

  // Calculate pagination values
  const totalPages = Math.ceil(filteredStudentPerformance.length / studentsPerPage);
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudentPerformance.slice(indexOfFirstStudent, indexOfLastStudent);

  // Page change handlers
  const goToPage = (pageNumber) => {
    setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedClass]);

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
        <div className="flex justify-between mb-4">
          <h3 className="text-lg font-semibold">Top Performing Students</h3>
          
          {/* Rows per page selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Rows:</span>
            <select
              value={studentsPerPage}
              onChange={e => {
                setStudentsPerPage(Number(e.target.value));
                setCurrentPage(1); // Reset to first page when changing rows per page
              }}
              className="text-sm p-1 border border-gray-300 rounded-md"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
        
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
              {currentStudents.length > 0 ? (
                currentStudents.map((student, index) => (
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
        
        {/* Pagination Controls */}
        {filteredStudentPerformance.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 mt-4">
            <div className="flex flex-1 justify-between sm:hidden">
              {/* Mobile pagination */}
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                  currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                  currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstStudent + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastStudent, filteredStudentPerformance.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredStudentPerformance.length}</span> students
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                      currentPage === 1 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-500 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  
                  {/* Page numbers - show max 5 page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                    // Calculate which page numbers to show
                    let pageNum;
                    if (totalPages <= 5) {
                      // If 5 or fewer pages, show all
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      // If near the start, show first 5 pages
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      // If near the end, show last 5 pages
                      pageNum = totalPages - 4 + i;
                    } else {
                      // Otherwise show 2 pages before and after current
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          currentPage === pageNum
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                      currentPage === totalPages 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-500 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
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