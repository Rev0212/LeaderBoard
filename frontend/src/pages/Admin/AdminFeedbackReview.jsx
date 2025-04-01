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
        
        console.log("Feedback response:", response.data);
        setFeedbacks(response.data.feedback || []);
      } catch (err) {
        console.error("Feedback fetch error:", err);
        setError('Failed to load feedbacks.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 p-6">{error}</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Student Feedback</h1>
      {feedbacks.length > 0 ? (
        <ul className="space-y-4">
          {feedbacks.map((feedback) => (
            <li key={feedback._id} className="p-4 bg-white rounded-lg shadow">
              {/* Display student information */}
              <div className="mb-2">
                <span className="font-semibold">Student: </span>
                <span>{feedback.student ? feedback.student.name : 'Unknown'}</span>
                <span className="ml-4 font-semibold">Register No: </span>
                <span>{feedback.student ? feedback.student.registerNo : feedback.registerNo || 'N/A'}</span>
              </div>
              <div className="border-l-4 border-gray-300 pl-3 py-1">
                <p className="text-gray-700">{feedback.comment}</p>
              </div>
              <p className="text-gray-500 text-sm mt-2">Submitted on: {new Date(feedback.createdAt).toLocaleString()}</p>
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

