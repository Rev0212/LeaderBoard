import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, LinkIcon, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UpcomingEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

  // Function to check if the user is a teacher
  const isTeacher = () => {
    return localStorage.getItem('token') || localStorage.getItem('teacher-token');
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${VITE_BASE_URL}/upcoming-events`);
        setEvents(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load upcoming events');
        setLoading(false);
      }
    };

    fetchEvents();
  }, [VITE_BASE_URL]);

  // Function to handle navigation back to appropriate dashboard
  const handleBack = () => {
    if (isTeacher()) {
      navigate('/teacher-dashboard');
    } else {
      navigate('/student-dashboard');
    }
  };

  const getGdriveImageUrl = (url) => {
    // Return the URL as is or process it if needed
    return url;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Add back button */}
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
      >
        <ArrowLeft size={18} />
        <span>Back to Dashboard</span>
      </button>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Upcoming Events</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="w-full h-48 relative">
              <iframe
                src={getGdriveImageUrl(event.posterLink)}
                className="w-full h-full border-none"
                title={event.eventName}
                loading="lazy"
                allowFullScreen
              />
            </div>
            
            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {event.eventName}
              </h2>
              
              <div className="flex items-center text-gray-600 mb-2">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(event.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              
              <p className="text-gray-600 mb-4">
                {event.content}
              </p>
              
              <a
                href={event.registrationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                Register Now
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingEvents;