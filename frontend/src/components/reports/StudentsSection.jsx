import React, { useState, useEffect } from 'react';
import { Search, Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react';

const StudentsSection = ({ detailedStudentPerformance, inactiveStudents, availableClasses }) => {
  // Add state to store the processed inactive students data
  const [processedInactiveStudents, setProcessedInactiveStudents] = useState([]);
  
  // Other state variables remain the same
  const [performanceSearchQuery, setPerformanceSearchQuery] = useState('');
  const [performanceSelectedClass, setPerformanceSelectedClass] = useState('All');
  const [inactiveSearchQuery, setInactiveSearchQuery] = useState('');
  const [inactiveSelectedClass, setInactiveSelectedClass] = useState('All');
  const [inactiveDaysFilter, setInactiveDaysFilter] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage, setStudentsPerPage] = useState(10);
  const [inactiveCurrentPage, setInactiveCurrentPage] = useState(1);
  const [inactiveStudentsPerPage, setInactiveStudentsPerPage] = useState(10);

  // Process the inactiveStudents prop to handle different formats
  useEffect(() => {
    console.log('Received inactiveStudents:', inactiveStudents);
    
    let studentsArray = [];
    
    // If it's an object with 'success' and 'data' properties, extract the data array
    if (inactiveStudents && typeof inactiveStudents === 'object') {
      if (Array.isArray(inactiveStudents)) {
        // It's already an array
        studentsArray = inactiveStudents;
        console.log('Using inactiveStudents as array directly');
      } else if (inactiveStudents.data && Array.isArray(inactiveStudents.data)) {
        // It's the API response object with a data property
        studentsArray = inactiveStudents.data;
        console.log('Extracted data array from inactiveStudents.data');
      } else if (inactiveStudents.success && inactiveStudents.data) {
        // It's the API response with success flag
        studentsArray = inactiveStudents.data;
        console.log('Extracted data array from success response');
      } else {
        console.log('inactiveStudents has unexpected format:', inactiveStudents);
      }
    } else {
      console.log('inactiveStudents is null or not an object');
    }
    
    console.log('Processed inactiveStudents array length:', studentsArray.length);
    setProcessedInactiveStudents(studentsArray);
  }, [inactiveStudents]);

  // Filter detailed student performance based on search and class
  const filteredStudentPerformance = detailedStudentPerformance
    .filter(student => 
      (performanceSelectedClass === 'All' || student.className === performanceSelectedClass) &&
      (student.name.toLowerCase().includes(performanceSearchQuery.toLowerCase()) || 
       student.registerNo.toLowerCase().includes(performanceSearchQuery.toLowerCase()))
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
  useEffect(() => {
    setCurrentPage(1);
  }, [performanceSearchQuery, performanceSelectedClass]);

  // Rest of your filtering logic, but now using processedInactiveStudents
  console.log('Before filtering, processedInactiveStudents:', processedInactiveStudents.length);
  console.log('Filter settings - class:', inactiveSelectedClass, 'days:', inactiveDaysFilter, 'search:', inactiveSearchQuery);

  const filteredInactiveStudents = processedInactiveStudents
    .filter(student => {
      // Class filter check
      const passesClassFilter = (inactiveSelectedClass === 'All' || student.className === inactiveSelectedClass);
      
      // Search filter check
      const passesSearchFilter = (
        student.name?.toLowerCase().includes(inactiveSearchQuery.toLowerCase()) || 
        student.registerNo?.toLowerCase().includes(inactiveSearchQuery.toLowerCase())
      );
      
      // Days filter check
      const passesDaysFilter = (student.inactiveDays >= inactiveDaysFilter);
      
      // Return combined result and log failures
      if (!passesClassFilter) console.log('Failed class filter:', student.className);
      if (!passesSearchFilter) console.log('Failed search filter');
      if (!passesDaysFilter) console.log('Failed days filter:', student.inactiveDays);
      
      return passesClassFilter && passesSearchFilter && passesDaysFilter;
    });

  console.log('After filtering, filteredInactiveStudents:', filteredInactiveStudents.length);

  // Calculate pagination values for inactive students
  const inactiveTotalPages = Math.ceil(filteredInactiveStudents.length / inactiveStudentsPerPage);
  const indexOfLastInactiveStudent = inactiveCurrentPage * inactiveStudentsPerPage;
  const indexOfFirstInactiveStudent = indexOfLastInactiveStudent - inactiveStudentsPerPage;
  const currentInactiveStudents = filteredInactiveStudents.slice(indexOfFirstInactiveStudent, indexOfLastInactiveStudent);

  // Add these pagination handler functions
  const goToInactivePage = (pageNumber) => {
    setInactiveCurrentPage(Math.max(1, Math.min(pageNumber, inactiveTotalPages)));
  };

  const goToPreviousInactivePage = () => {
    setInactiveCurrentPage(prev => Math.max(1, prev - 1));
  };

  const goToNextInactivePage = () => {
    setInactiveCurrentPage(prev => Math.min(inactiveTotalPages, prev + 1));
  };

  // Reset to first page when inactive filters change
  useEffect(() => {
    setInactiveCurrentPage(1);
  }, [inactiveSearchQuery, inactiveSelectedClass, inactiveDaysFilter]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Student Analysis</h2>
      
      {/* Student Performance Table with filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">Top Performing Students</h3>
        
        {/* Performance Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={performanceSearchQuery}
              onChange={e => setPerformanceSearchQuery(e.target.value)}
              placeholder="Search by name or register number..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {performanceSearchQuery && (
              <button 
                onClick={() => setPerformanceSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          
          {/* Class Filter */}
          <div className="md:w-48">
            <select
              value={performanceSelectedClass}
              onChange={e => setPerformanceSelectedClass(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="All">All Classes</option>
              {availableClasses.map((classInfo, index) => (
                <option key={`${classInfo.className}-${index}-${classInfo._id || ''}`} value={classInfo.className}>
                  {classInfo.className}
                </option>
              ))}
            </select>
          </div>
          
          {/* Rows per page selector */}
          <div className="md:w-48 flex items-center justify-end">
            <span className="text-sm text-gray-600 mr-2">Rows:</span>
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
      
      {/* Inactive Students Table with filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Inactive Students</h3>
        
        {/* Inactive Students Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={inactiveSearchQuery}
              onChange={e => setInactiveSearchQuery(e.target.value)}
              placeholder="Search by name or register number..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {inactiveSearchQuery && (
              <button 
                onClick={() => setInactiveSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          
          {/* Class Filter */}
          <div className="md:w-48">
            <select
              value={inactiveSelectedClass}
              onChange={e => setInactiveSelectedClass(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="All">All Classes</option>
              {availableClasses.map((classInfo, index) => (
                <option key={`${classInfo.className}-${index}-${classInfo._id || ''}`} value={classInfo.className}>
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
          
          {/* Add this to your filters section for inactive students */}
          <div className="md:w-48 flex items-center justify-end">
            <span className="text-sm text-gray-600 mr-2">Rows:</span>
            <select
              value={inactiveStudentsPerPage}
              onChange={e => {
                setInactiveStudentsPerPage(Number(e.target.value));
                setInactiveCurrentPage(1); // Reset to first page when changing rows per page
              }}
              className="text-sm p-1 border border-gray-300 rounded-md"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inactive Days</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentInactiveStudents.length > 0 ? (
                currentInactiveStudents.map((student, index) => (
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
        
        {/* Add pagination controls for inactive students table */}
        {filteredInactiveStudents.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 mt-4">
            <div className="flex flex-1 justify-between sm:hidden">
              {/* Mobile pagination */}
              <button
                onClick={goToPreviousInactivePage}
                disabled={inactiveCurrentPage === 1}
                className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                  inactiveCurrentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <button
                onClick={goToNextInactivePage}
                disabled={inactiveCurrentPage === inactiveTotalPages}
                className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                  inactiveCurrentPage === inactiveTotalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstInactiveStudent + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastInactiveStudent, filteredInactiveStudents.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredInactiveStudents.length}</span> students
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={goToPreviousInactivePage}
                    disabled={inactiveCurrentPage === 1}
                    className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                      inactiveCurrentPage === 1 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-500 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  
                  {/* Page numbers - show max 5 page numbers */}
                  {Array.from({ length: Math.min(5, inactiveTotalPages) }).map((_, i) => {
                    // Calculate which page numbers to show
                    let pageNum;
                    if (inactiveTotalPages <= 5) {
                      // If 5 or fewer pages, show all
                      pageNum = i + 1;
                    } else if (inactiveCurrentPage <= 3) {
                      // If near the start, show first 5 pages
                      pageNum = i + 1;
                    } else if (inactiveCurrentPage >= inactiveTotalPages - 2) {
                      // If near the end, show last 5 pages
                      pageNum = inactiveTotalPages - 4 + i;
                    } else {
                      // Otherwise show 2 pages before and after current
                      pageNum = inactiveCurrentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToInactivePage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          inactiveCurrentPage === pageNum
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={goToNextInactivePage}
                    disabled={inactiveCurrentPage === inactiveTotalPages}
                    className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                      inactiveCurrentPage === inactiveTotalPages 
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
    </div>
  );
};

export default StudentsSection;