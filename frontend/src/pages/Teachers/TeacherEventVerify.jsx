import React, { useState, useEffect } from 'react';
import { ArrowLeft, Pencil, FileText } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import EventDetailsModal from '../../components/EventEditModel';

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

const TeacherEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'approved', 'rejected', 'pending'

  const location = useLocation();
  const navigate = useNavigate();
  const { studentId, studentName } = location.state || {};

  const fetchAllEvents = async () => {
    try {
      // Change from 'token' to 'teacher-token'
      const token = localStorage.getItem('teacher-token');
      
      const response = await axios.get(
        `${VITE_BASE_URL}/event/student-events/${studentId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Transform the data to ensure status is properly set
      const transformedEvents = response.data.map(event => ({
        ...event,
        status: event.status || 'Pending' // Ensure status is set if undefined
      }));
      
      setEvents(transformedEvents);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch events. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchAllEvents();
    }
  }, [studentId]);

  const updateEventStatus = async (eventId, newStatus) => {
    try {
      // Change from 'token' to 'teacher-token'
      const token = localStorage.getItem('teacher-token');
      
      await axios.patch(
        `${VITE_BASE_URL}/event/edit/${eventId}`,
        {
          newStatus: newStatus
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      // Refresh the page after a successful update
      fetchAllEvents();
    } catch (err) {
      setError('Failed to update event status. Please try again.');
    }
  };

  const handleApprove = () => {
    if (selectedEvent && selectedEvent._id) {
      updateEventStatus(selectedEvent._id, 'Approved');
      setSelectedEvent(null);
    } else {
      alert('No event selected');
    }
  };

  const handleReject = () => {
    if (selectedEvent && selectedEvent._id) {
      updateEventStatus(selectedEvent._id, 'Rejected');
      setSelectedEvent(null);
    } else {
      alert('No event selected');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleBack = () => {
    // Use browser history to go back to previous page (class list)
    navigate(-1);
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
          onClick={handleBack}
          className="flex items-center gap-2 text-blue-500 hover:underline"
        >
          <ArrowLeft size={20} />
          Back to Class List
        </button>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Events for {studentName}
        </h1>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-4">
          <label className="text-gray-700">Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-md px-3 py-1.5 text-gray-700 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Events</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm flex-1">
          <div className="text-sm text-gray-500">Total Events</div>
          <div className="text-2xl font-semibold">{events.length}</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm flex-1">
          <div className="text-sm text-gray-500">Approved</div>
          <div className="text-2xl font-semibold text-green-600">
            {events.filter(e => e.status === 'Approved').length}
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm flex-1">
          <div className="text-sm text-gray-500">Rejected</div>
          <div className="text-2xl font-semibold text-red-600">
            {events.filter(e => e.status === 'Rejected').length}
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm flex-1">
          <div className="text-sm text-gray-500">Pending</div>
          <div className="text-2xl font-semibold text-yellow-600">
            {events.filter(e => e.status === 'Pending').length}
          </div>
        </div>
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
              {events
                .filter(event => statusFilter === 'all' || event.status === statusFilter)
                .map((event) => (
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full ${getStatusColor(event.status)}`}>
                        {event.status}
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
