import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Link as LinkIcon } from 'lucide-react';

const UpcomingEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${VITE_BASE_URL}/upcoming-events`);
        setEvents(response.data);
      } catch (err) {
        setError('Failed to fetch upcoming events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const getGdriveImageUrl = (driveLink) => {
    try {
      let fileId;
      
      if (driveLink.includes('/file/d/')) {
        fileId = driveLink.split('/file/d/')[1].split('/')[0];
      } else if (driveLink.includes('id=')) {
        fileId = driveLink.split('id=')[1].split('&')[0];
      } else {
        const match = driveLink.match(/[-\w]{25,}/);
        fileId = match ? match[0] : null;
      }

      if (!fileId) {
        return '/placeholder-image.jpg';
      }

      // Use the preview URL format
      return `https://drive.google.com/file/d/${fileId}/preview`;
    } catch (error) {
      console.error('Error parsing Google Drive URL:', error);
      return '/placeholder-image.jpg';
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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