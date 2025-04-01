import React, { useState } from 'react';
import axios from 'axios';

const FeedbackForm = () => {
  const [comment, setComment] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Get the student token from localStorage
    const token = localStorage.getItem('student-token');
    
    if (!token) {
      setErrorMessage('You must be logged in to submit feedback.');
      return;
    }
    
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/feedback`, 
        { comment },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setSuccessMessage('Thank you for your feedback!');
      setComment('');
      setErrorMessage('');
    } catch (error) {
      console.error('Feedback submission error:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to submit feedback. Please try again.');
      setSuccessMessage('');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Provide Your Feedback</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows="4"
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Your feedback..."
          required
        />
        <button type="submit" className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Submit
        </button>
      </form>
      {successMessage && <p className="text-green-500 mt-2">{successMessage}</p>}
      {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
    </div>
  );
};

export default FeedbackForm;