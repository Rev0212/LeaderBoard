import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminFeedbackReview = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/feedback`);
        setFeedbacks(response.data);
      } catch (err) {
        setError('Failed to load feedbacks.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Feedback Review</h1>
      {feedbacks.length > 0 ? (
        <ul className="space-y-4">
          {feedbacks.map((feedback) => (
            <li key={feedback._id} className="p-4 bg-white rounded-lg shadow">
              <p>{feedback.comment}</p>
              <p className="text-gray-500 text-sm">Submitted on: {new Date(feedback.createdAt).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No feedback available.</p>
      )}
    </div>
  );
};

export default AdminFeedbackReview; 

