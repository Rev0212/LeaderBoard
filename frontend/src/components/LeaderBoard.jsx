import React, { useEffect, useState, useCallback } from 'react';
import { Medal, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import axios from 'axios';
import { isCreator, getCreatorStyles, getCreatorBadge } from '../utils/creatorUtils';

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

const LeaderboardTable = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Using useCallback to memoize the fetch function
  const fetchLeaderboardData = useCallback(async (page, limit, search) => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem('student-token');
      const response = await axios.get(`${VITE_BASE_URL}/leaderboard/my-context`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        params: {
          page,
          limit,
          search,
        },
      });
      
      console.log('Leaderboard response:', response.data);
      
      if (response.data && Array.isArray(response.data.data)) {
        setLeaderboardData(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        setLeaderboardData([]);
        setTotalPages(1);
        console.error('Invalid data format received:', response.data);
      }
      setError(null);
    } catch (err) {
      setError('Failed to fetch leaderboard data');
      setLeaderboardData([]);
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial load with current page and items per page
    fetchLeaderboardData(currentPage, itemsPerPage, searchQuery);
  }, [currentPage, itemsPerPage, fetchLeaderboardData]);

  // Debounced search handler with 500ms delay
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout to debounce the search
    const timeoutId = setTimeout(() => {
      setCurrentPage(1); // Reset to first page
      fetchLeaderboardData(1, itemsPerPage, query);
    }, 500); // Increased to 500ms for better debouncing
    
    setSearchTimeout(timeoutId);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Always render the container, search, and controls
  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      {/* Container with mobile-first padding */}
      <div className="p-4 md:p-6">
        {/* Header Section - Responsive Flex Layout */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          {/* Title with Medal Icon */}
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Medal className="h-6 w-6 text-yellow-500" />
            <h2 className="text-lg md:text-xl font-bold text-gray-900">
              Leaderboard
            </h2>
          </div>
          
          {/* Search and Items Per Page - Responsive Layout */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {/* Search Input with Responsive Width */}
            <div className="relative flex-grow md:flex-grow-0 md:w-64">
              <input
                type="text"
                placeholder="Search by name or register number..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full border rounded-lg px-4 py-2 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            
            {/* Items Per Page Dropdown */}
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="w-full sm:w-auto border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
        </div>
        
        {/* Conditional Content Based on State */}
        {loading ? (
          <div className="flex justify-center items-center h-64 text-gray-500">
            Loading...
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64 text-red-500">
            {error}
          </div>
        ) : leaderboardData.length === 0 ? (
          <div className="flex justify-center items-center h-64 text-gray-500">
            No leaderboard data available
          </div>
        ) : (
          <>
            {/* Leaderboard List - Scrollable with Max Height */}
            <div className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-50">
              <div className="space-y-2">
                {leaderboardData.map((student, index) => (
                  <div
                    key={student._id}
                    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg transition-colors ${
                      isCreator(student.registerNo) 
                        ? 'bg-gradient-to-r from-gray-900/5 via-purple-900/5 to-blue-900/5 border-l-4 border-purple-500' 
                        : index % 2 === 1 ? 'bg-gray-50' : 'bg-white'
                    } hover:bg-gray-100 space-y-2 sm:space-y-0`}
                  >
                    {/* Rank and Name Section - Responsive Layout */}
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="flex items-center justify-center w-8 h-8">
                        {student.rank <= 3 ? (
                          <span className={`text-lg font-bold ${
                            student.rank === 1 ? 'text-yellow-500' :
                            student.rank === 2 ? 'text-gray-400' :
                            'text-orange-500'
                          }`}>
                            #{student.rank}
                          </span>
                        ) : (
                          <span className="text-lg font-bold text-gray-400">
                            #{student.rank}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${isCreator(student.registerNo) ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600' : 'text-gray-900'}`}>
                            {student.name}
                          </span>
                          {isCreator(student.registerNo) && (
                            <span className="hidden sm:inline-block ml-1">{getCreatorBadge(student.registerNo)}</span>
                          )}
                        </div>
                        <span className="text-sm text-gray-600 sm:ml-2">
                          [{student.registerNo}]
                        </span>
                      </div>
                    </div>
                    
                    {/* Points Section - With special styling for creators */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className={`font-bold ${isCreator(student.registerNo) ? 'text-purple-600' : 'text-blue-600'}`}>
                        {student.totalPoints.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500">points</span>
                      {isCreator(student.registerNo) && (
                        <span className="sm:hidden inline-block ml-1">{getCreatorBadge(student.registerNo)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        
        {/* Pagination - Always shown but disabled if necessary */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t border-gray-100 gap-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading || leaderboardData.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto justify-center"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </button>
          
          <span className="text-sm text-gray-600 order-first sm:order-none">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading || leaderboardData.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto justify-center"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardTable;