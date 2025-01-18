import React, { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

const ClassDetails = ({ classId, handleBackToDashboard }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const fetchClassDetails = async () => {
    if (!classId) {
      setError("No class assigned");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/class/${classId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      const classData = response.data.class;
      setStudents(classData.students);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching class details:", err);
      setError(err.response?.data?.message || "Failed to fetch class details.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassDetails();
  }, [classId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <button
        onClick={handleBackToDashboard}
        className="flex items-center gap-2 text-blue-500 hover:underline mb-6"
      >
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Class Students</h1>

      {students.length > 0 ? (
        <table className="table-auto w-full bg-white shadow-md rounded-lg border border-gray-200">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2 text-left text-gray-600">Name</th>
              <th className="px-4 py-2 text-left text-gray-600">Email</th>
              <th className="px-4 py-2 text-left text-gray-600">Register No</th>
              <th className="px-4 py-2 text-left text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student._id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="px-4 py-2 text-gray-800">{student.name}</td>
                <td className="px-4 py-2 text-gray-800">{student.email}</td>
                <td className="px-4 py-2 text-gray-800">{student._id}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() =>
                      navigate("/teacher-events", {
                        state: { studentId: student._id, studentName: student.name },
                      })
                    }
                    className="bg-blue-500 text-white rounded px-4 py-1 hover:bg-blue-600"
                  >
                    View Events
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-600 mt-4">No students found in the class.</p>
      )}
    </div>
  );
};

export default ClassDetails;
