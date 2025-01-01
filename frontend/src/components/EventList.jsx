import React, { useEffect, useState } from 'react';
import { CalendarDays } from 'lucide-react';

const EventHistoryTable = () => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/student/profile`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('student-token')}`,
              'Content-Type': 'application/json' 
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch student profile');
        }

        const data = await response.json();
        setStudentData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, []);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="border rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="h-5 w-5" />
          <h2 className="text-lg font-bold">Event History</h2>
        </div>
        <div className="flex justify-center items-center h-40">
          <div className="text-gray-500">Loading event history...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="h-5 w-5" />
          <h2 className="text-lg font-bold">Event History</h2>
        </div>
        <div className="flex justify-center items-center h-40 text-red-500">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!studentData?.eventsParticipated?.length) {
    return (
      <div className="border rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="h-5 w-5" />
          <h2 className="text-lg font-bold">Event History</h2>
        </div>
        <div className="flex justify-center items-center h-40 text-gray-500">
          No events participated yet.
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg shadow-sm">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="h-5 w-5" />
          <h2 className="text-lg font-bold">Event History</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Event Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Position</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Points</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {studentData.eventsParticipated
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((event) => (
                <tr key={event._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {event.eventName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDate(event.date)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {event.positionSecured}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {event.pointsEarned}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EventHistoryTable;