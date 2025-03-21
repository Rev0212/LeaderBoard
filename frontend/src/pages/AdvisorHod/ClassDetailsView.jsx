import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Search, Users } from "lucide-react";

const ClassDetailsView = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classDetails, setClassDetails] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        const token = localStorage.getItem("teacher-token");
        console.log("Using token for class details:", token ? `${token.substring(0, 10)}...` : 'No token found');
        
        if (!token) {
          throw new Error("Authentication token not found");
        }
        
        const response = await axios.get(
          `${VITE_BASE_URL}/class/details/${classId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setClassDetails(response.data);
        
        // Handle different response structures
        if (response.data && response.data.students) {
          setStudents(response.data.students);
        } else if (response.data && response.data.class && response.data.class.students) {
          setStudents(response.data.class.students);
        } else {
          setStudents([]);
        }
        
      } catch (err) {
        console.error("Error fetching class details:", err);
        
        if (err.response && err.response.status === 401) {
          setError("Your session has expired. Please log in again.");
          setTimeout(() => navigate("/teacher-login"), 2000);
        } else {
          setError(err.response?.data?.message || "Failed to fetch class details");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchClassDetails();
  }, [VITE_BASE_URL, classId]);

  const handleBackToClasses = () => {
    navigate("/advisor-hod-dashboard");
  };

  const handleExportCSV = () => {
    if (!students.length) return;
    
    // Create CSV content
    const headers = "Name,Email,Register No.,Department,Total Points\n";
    const rows = students.map(student => 
      `"${student.name}","${student.email}","${student.registerNo}","${student.department}","${student.totalPoints || 0}"`
    ).join("\n");
    
    const csvContent = `data:text/csv;charset=utf-8,${headers}${rows}`;
    const encodedUri = encodeURI(csvContent);
    
    // Create download link and trigger download
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `class-students-${classDetails?.className || classId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.registerNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <button
          onClick={handleBackToClasses}
          className="flex items-center gap-2 text-blue-500 hover:underline mb-6"
        >
          <ArrowLeft size={20} />
          Back to Classes
        </button>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <button
        onClick={handleBackToClasses}
        className="flex items-center gap-2 text-blue-500 hover:underline mb-6"
      >
        <ArrowLeft size={20} />
        Back to Classes
      </button>

      {/* Class Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          {classDetails?.className || `${classDetails?.year}-${classDetails?.section}`}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Department</p>
            <p className="text-lg font-medium text-gray-800">{classDetails?.department}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Academic Year</p>
            <p className="text-lg font-medium text-gray-800">{classDetails?.academicYear}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Students</p>
            <p className="text-lg font-medium text-gray-800">{students.length}</p>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Students ({filteredStudents.length})</h2>
          </div>
          <button
            onClick={handleExportCSV}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            disabled={!students.length}
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, register number or email..."
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Students Table */}
        <div className="overflow-x-auto">
          {filteredStudents.length > 0 ? (
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Register Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.registerNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {student.totalPoints || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No students found.</p>
              {searchQuery && (
                <p className="text-sm text-gray-400 mt-2">
                  Try adjusting your search query.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassDetailsView;