import React, { useEffect, useState } from 'react';
import { Medal } from 'lucide-react';

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

const LeaderboardTable = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${VITE_BASE_URL}/leaderboard`,{
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('student-token')}`,
              'Content-Type': 'application/json'
            }});
        const data = await response.json();
        
        if (!data.success) {
          throw new Error('Failed to fetch leaderboard data');
        }
        
        setLeaderboardData(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="border rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-2 mb-4">
          <Medal className="h-5 w-5" />
          <h2 className="text-lg font-bold">Leaderboard</h2>
        </div>
        <div className="flex justify-center items-center h-40">
          <div className="text-gray-500">Loading leaderboard data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-2 mb-4">
          <Medal className="h-5 w-5" />
          <h2 className="text-lg font-bold">Leaderboard</h2>
        </div>
        <div className="flex justify-center items-center h-40 text-red-500">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg shadow-sm">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Medal className="h-5 w-5" />
          <h2 className="text-lg font-bold">Leaderboard</h2>
        </div>
        
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
    </div>
  );
};

export default LeaderboardTable;