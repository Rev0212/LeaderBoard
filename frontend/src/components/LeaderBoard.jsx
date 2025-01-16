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
    <div className="border rounded-lg shadow-sm">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Medal className="h-5 w-5" />
            <h2 className="text-lg font-bold">Leaderboard</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={handleSearch}
                className="border rounded-md px-3 py-1.5 pl-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="h-4 w-4 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
            </div>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="border rounded-md px-2 py-1"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
        </div>
        
        <div className="max-h-[700px] overflow-y-auto">
          <div className="space-y-3">
            {leaderboardData.map((student, index) => (
              <div
                key={student._id}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  index % 2 === 1 ? 'bg-gray-50' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold text-gray-500">
                    #{student.rank}
                  </span>
                  <span className="font-medium">{student.name}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="font-bold">{student.totalPoints}</span>
                  <span className="text-sm text-gray-500">points</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 border-t pt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1 rounded-md bg-gray-100 disabled:opacity-50"
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
            className="flex items-center gap-1 px-3 py-1 rounded-md bg-gray-100 disabled:opacity-50"
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