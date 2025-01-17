import React, { useState } from 'react';
import axios from 'axios';

console.log('Base URL:', import.meta.env.VITE_BASE_URL);

const AdminUpcomingEventForm = () => {
  const [formData, setFormData] = useState({
    eventName: '',
    date: '',
    posterLink: '',
    registrationLink: '',
    content: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form Data being sent:', formData);
    try {
      console.log('Making API request to:', `${import.meta.env.VITE_BASE_URL}/upcoming-events/create`);
      
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/upcoming-events/create`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('API Response:', response.data);
      setSuccess('Event created successfully!');
      setFormData({
        eventName: '',
        date: '',
        posterLink: '',
        registrationLink: '',
        content: ''
      });
    } catch (err) {
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(err.response?.data?.error || 'Failed to create event');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Create New Event</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Event Name</label>
          <input
            type="text"
            value={formData.eventName}
            onChange={(e) => setFormData({...formData, eventName: e.target.value})}
            className="mt-1 block w-full rounded-md border border-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Google Drive Poster Link</label>
          <input
            type="url"
            value={formData.posterLink}
            onChange={(e) => setFormData({...formData, posterLink: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Registration Link</label>
          <input
            type="url"
            value={formData.registrationLink}
            onChange={(e) => setFormData({...formData, registrationLink: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Content</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
            rows="4"
            className="mt-1 block w-full rounded-md border border-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
            required
          />
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-500 text-sm">{success}</div>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Create Event
        </button>
      </form>
    </div>
  );
};

export default AdminUpcomingEventForm; 