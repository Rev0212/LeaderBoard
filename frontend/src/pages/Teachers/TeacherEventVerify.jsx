import React, { useState, useEffect } from 'react';
import { ArrowLeft, Pencil, FileText } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import EventDetailsModal from '../../components/EventDetailModel';

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

const TeacherEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { studentId, studentName } = location.state || {};

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${VITE_BASE_URL}/student/events/${studentId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        console.log(response.data);
        setEvents(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to fetch events. Please try again.');
        setLoading(false);
      }
    };

    if (studentId) {
      fetchEvents();
    }
  }, [studentId]);

  const updateEventStatus = async (eventId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${VITE_BASE_URL}/event/${eventId}/review`,
        {
          status: newStatus
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      // Clear the local state and trigger a refetch after successful API call
      setEvents([]);
      fetchEvents();
    } catch (error) {
      console.error('Error updating event status:', error);
      // Show error message to user
      alert('Failed to update event status. Please try again.');
    }
  };
  

  const handleApprove = () => {
    if (selectedEvent) {
      updateEventStatus(selectedEvent._id, 'Approved');
      setSelectedEvent(null);
    }
  };

  const handleReject = () => {
    if (selectedEvent) {
      updateEventStatus(selectedEvent._id, 'Rejected');
      setSelectedEvent(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <div className="text-gray-500">Loading events...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-500 hover:underline"
        >
          <ArrowLeft size={20} />
          Back
        </button>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Events for {studentName}
        </h1>
      </div>

      {events.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          No events found for this student
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 bg-white shadow-sm rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PDF
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Edit
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {events.map((event) => (
                <tr key={event._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {event.eventName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {event.date ? new Date(event.date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {event.category || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {event.positionSecured || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                      {event.status || 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a href={`http://localhost:4000/uploads/pdf/${event.pdfDocument}`} target="_blank" rel="noopener noreferrer">
                      <FileText className="text-blue-500 hover:text-blue-700" size={20} />
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setSelectedEvent(event)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="View Details"
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
};

export default TeacherEventsPage;