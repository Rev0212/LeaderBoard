import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Pencil } from 'lucide-react';
import EditEventModal from './EditEventModal';

const UpcomingEventsList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchEvents = async () => {
    try {
    //   console.log('Fetching events from:', `${import.meta.env.VITE_BASE_URL}/upcoming-events`);
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/upcoming-events`);
    //   console.log('Response:', response);
      setEvents(response.data);
    } catch (err) {
      console.error('Error details:', err);
      setError(err.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      await axios.delete(`${import.meta.env.VITE_BASE_URL}/upcoming-events/${eventId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin-token')}`
        }
      });
      // Refresh the events list
      fetchEvents();
    } catch (err) {
      setError('Failed to delete event');
    }
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);
  };

  const handleCloseEdit = () => {
    setSelectedEvent(null);
  };

  const handleUpdateEvent = async (updatedEvent) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/upcoming-events/${updatedEvent._id}`,
        updatedEvent
      );
      // Refresh the events list
      fetchEvents();
      setSelectedEvent(null);
    } catch (err) {
      console.error('Update error:', err);
      setError('Failed to update event');
    }
  };

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Current Events</h2>
      <div className="space-y-4">
        {events.length === 0 ? (
          <p className="text-gray-500 text-center">No upcoming events found</p>
        ) : (
          events.map((event) => (
            <div 
              key={event._id} 
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex-1">
                <h3 className="font-medium text-lg">{event.eventName}</h3>
                <p className="text-gray-600">
                  {new Date(event.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(event)}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"
                  title="Edit event"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(event._id)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                  title="Delete event"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedEvent && (
        <EditEventModal
          event={selectedEvent}
          onClose={handleCloseEdit}
          onUpdate={handleUpdateEvent}
        />
      )}
    </div>
  );
};

export default UpcomingEventsList; 