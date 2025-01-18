import React, { useEffect, useState } from 'react';
import { Medal, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import axios from 'axios';

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

  const fetchLeaderboardData = async (page, limit, search) => {
    try {
      setLoading(true);
      const response = await axios.get(`${VITE_BASE_URL}/leaderboard`, {
        params: {
          page,
          limit,
          search,
        },
      });
      
      setLeaderboardData(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
      setError(null);
    } catch (err) {
      setError('Failed to fetch leaderboard data');
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData(currentPage, itemsPerPage, searchQuery);
  }, [currentPage, itemsPerPage]);

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
    }, 300); // Wait 300ms after user stops typing
    
    setSearchTimeout(timeoutId);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white border rounded-lg shadow-sm">
      <div className="p-4 lg:p-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Medal className="h-6 w-6 text-yellow-500" />
            <h2 className="text-lg lg:text-xl font-bold text-gray-900">Leaderboard</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full sm:w-64 border rounded-lg px-4 py-2 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="w-full sm:w-auto border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
        </div>
        
        {/* Leaderboard List */}
        <div className="max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-50">
          <div className="space-y-2">
            {leaderboardData.map((student, index) => (
              <div
                key={student._id}
                className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                  index % 2 === 1 ? 'bg-gray-50' : 'bg-white'
                } hover:bg-gray-100`}
              >
                <div className="flex items-center gap-4">
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
                  <span className="font-medium text-gray-900">{student.name}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="font-bold text-blue-600">{student.totalPoints.toLocaleString()}</span>
                  <span className="text-sm text-gray-500">points</span>
                </div>
              </div>
            ))}
          </div>
        </div>
  
        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardTable;