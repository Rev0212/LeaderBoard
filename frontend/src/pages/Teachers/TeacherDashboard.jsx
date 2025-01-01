import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, CheckCircle } from 'lucide-react';
import EventDetailsModal from '../../components/EventDetailModel';

const TeacherDashboard = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${VITE_BASE_URL}/event`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });
        setEvents(response.data);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, [VITE_BASE_URL]);

  const handleCheckNow = (event) => {
    setSelectedEvent(event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  const handleApprove = () => {
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event._id === selectedEvent._id ? { ...event, status: 'Approved' } : event
      )
    );
    handleCloseModal();
  };

  const handleReject = () => {
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event._id === selectedEvent._id ? { ...event, status: 'Rejected' } : event
      )
    );
    handleCloseModal();
  };

  const handleLogout = () => {
    console.log("Logging out...");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header with Profile and Logout */}
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Teacher Dashboard</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Logout
          </button>
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <span className="text-gray-800">Ms. Anderson</span>
            </button>
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-6">
          <Bell className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">Events to Review</h2>
        </div>

        <div className="space-y-4">
          {events.length > 0 ? (
            events.map((event) => (
              <div
                key={event._id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-lg text-gray-900">{event.submittedBy.name}</h3>
                  <p className="text-gray-600">{event.eventName}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(event.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="ml-4">
                  {event.status === 'Pending' ? (
                    <button
                      onClick={() => handleCheckNow(event)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Check Now
                    </button>
                  ) : event.status === 'Approved' ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Approved
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Rejected
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600">No events to review</p>
          )}
        </div>
      </div>

      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        onClose={handleCloseModal}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
};

export default TeacherDashboard;