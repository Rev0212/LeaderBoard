import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Bell,
  User,
  Users,
  LogOut,
  Building,
  Hash,
  CheckCircle,
  BarChart,
  Calendar,
  ExternalLink,
  BarChart3,
  FileText,
} from "lucide-react";
import TeacherProfile from "../../components/TeacherProfile";
import ClassDetails from "../../components/ClassList";
import UpcomingEvents from "../UpcomingEvents";
import FacultyReportPage from "./FacultyReportPage";

// Format event date helper function
const formatEventDate = (event) => {
  try {
    const dateValue = event.timestamp || event.createdAt || event.date;
    
    if (!dateValue) return "No date available";
    
    const date = new Date(dateValue);
    
    if (isNaN(date.getTime())) return "Invalid date";
    
    const options = { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    };
    
    return date.toLocaleDateString('en-US', options);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Date error";
  }
};

const TeacherDashboard = () => {
  const [events, setEvents] = useState([]);
  const [teacherData, setTeacherData] = useState(null);
  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedPDF, setSelectedPDF] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null); // New state for image viewing
  const [loading, setLoading] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const location = useLocation();

  const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

  const refreshTeacherData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token") || localStorage.getItem("teacher-token");
      
      if (!token) {
        console.error("No auth token found");
        return;
      }
      
      const response = await axios.get(`${VITE_BASE_URL}/teacher/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setTeacherData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error refreshing teacher data:", error);
      setLoading(false);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("teacher-token");
      const response = await axios.get(`${VITE_BASE_URL}/upcoming-events`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setUpcomingEvents(response.data);
    } catch (err) {
      console.error("Error fetching upcoming events:", err);
    }
  };

  useEffect(() => {
    if (location.state?.currentView === "classList") {
      setCurrentView("classList");
      refreshTeacherData(); // Make sure this function exists to refresh data
      
      // Clear the state after using it
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token") || localStorage.getItem("teacher-token");
        
        if (!token) {
          console.error("No auth token found");
          return;
        }
        
        console.log("Fetching events with token:", token.substring(0, 10) + "...");
        
        // First check if teacher has classes assigned
        const teacherResponse = await axios.get(`${VITE_BASE_URL}/teacher/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        console.log("Teacher has classes:", teacherResponse.data.classes?.length > 0);
        if (teacherResponse.data.classes) {
          const classIds = teacherResponse.data.classes.map(c => c._id).join(", ");
          console.log("Class IDs:", classIds);
        }
        
        // Now fetch events
        const response = await axios.get(`${VITE_BASE_URL}/event`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        console.log("Events API response status:", response.status);
        console.log("Events received:", response.data.length);
        setEvents(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching events:", error);
        if (error.response) {
          console.error("Response status:", error.response.status);
          console.error("Response data:", error.response.data);
        }
      }
    };

    fetchEvents();
    refreshTeacherData();
    fetchUpcomingEvents();
  }, [VITE_BASE_URL]);

  useEffect(() => {
    const fetchTeacherProfile = async () => {
      try {
        const response = await axios.get(`${VITE_BASE_URL}/teacher/profile`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });
        
        console.log("API response:", response);
        // Store the teacher data
        const teacherData = response.data.teacher || response.data;
        console.log("Processed teacher data:", teacherData);
        setTeacherData(teacherData);
      } catch (error) {
        console.error("Error fetching teacher profile:", error);
      }
    };

    fetchTeacherProfile();
  }, [VITE_BASE_URL]);

  const navigate = useNavigate();

  const handleLogoutClick = async () => { 
    const token = localStorage.getItem("teacher-token"); 
    try{
      const response = await axios.get(`${VITE_BASE_URL}/teacher/logout`,{
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if(response.status === 200) {
        localStorage.removeItem("token");
        navigate("/teacher-login"); 
      } 
    } catch(err) {  
      console.error("Error logging out:", err);
    }
  }

  const handleCheckNow = (event) => {
    setSelectedEvent(event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  const handleApprove = async () => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("teacher-token");
      await axios.patch(
        `${VITE_BASE_URL}/event/${selectedEvent._id}/review`,
        { status: 'Approved' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        }
      );
      
      setEvents((prevEvents) =>
        prevEvents.filter(event => event._id !== selectedEvent._id)
      );
      handleCloseModal();
    } catch (error) {
      console.error("Error approving event:", error);
      alert("Failed to approve event. Please try again.");
    }
  };

  const handleReject = async () => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("teacher-token");
      await axios.patch(
        `${VITE_BASE_URL}/event/${selectedEvent._id}/review`,
        { status: 'Rejected' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        }
      );
      
      setEvents((prevEvents) =>
        prevEvents.filter(event => event._id !== selectedEvent._id)
      );
      handleCloseModal();
    } catch (error) {
      console.error("Error rejecting event:", error);
      alert("Failed to reject event. Please try again.");
    }
  };

  const handleLogout = () => {
    console.log("Logging out...");
  };

  const handleShowProfile = () => {
    setShowProfile(true);
  };

  const handleShowClassList = () => {
    setShowClassList(true);
  };

  const handleBackToDashboard = () => {
    setShowProfile(false);
    setShowClassList(false);
  };

  const handleShowPDF = (event) => {
    if (event.pdfDocument) {
      // Use the path directly from the event object
      const pdfUrl = `${VITE_BASE_URL}${event.pdfDocument}`;
      setSelectedPDF(pdfUrl);
    } else {
      console.error('No PDF document available for this event');
    }
  };

  const handleClosePDFModal = () => {
    setSelectedPDF(null);
  };

  // New handler for showing certificate image
  const handleShowImage = (event) => {
    // Ensure the image exists before opening it in the modal
    if (event.proofUrl) {
      const imageUrl = `${VITE_BASE_URL}${event.proofUrl}`;
      setSelectedImage(imageUrl);  // Set the image URL to the state
    } else {
      console.error('No certificate proof available for this event');
    }
  };

  // New handler for closing image modal
  const handleCloseImageModal = () => {
    setSelectedImage(null);
  };

  const handleViewAllUpcomingEvents = () => {
    navigate('/teacher-upcoming-events');
  };

const getInactiveStudentCount = () => {
  if (!teacherData?.classes || !events.length) return 0;
  
  // Get total student count from classes
  const totalStudents = teacherData.classes.reduce((total, cls) => 
    total + (cls.students?.length || 0), 0);
  
  // Get unique active students (who have submitted events)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // Get unique student IDs with activity in the last 30 days
  const activeStudentIds = new Set();
  events.forEach(event => {
    const eventDate = new Date(event.timestamp || event.createdAt || event.date);
    if (eventDate >= thirtyDaysAgo) {
      activeStudentIds.add(event.submittedBy._id);
    }
  });
  
  // Return the difference (inactive students)
  return totalStudents - activeStudentIds.size;
};

  const renderContent = () => {
    if (currentView === "profile") {
      return (
        <TeacherProfile
          teacherData={teacherData}
          handleBackToDashboard={() => setCurrentView("dashboard")}
        />
      );
    }
  
    if (currentView === "classList") {
      return (
        <ClassDetails
          classId={teacherData?.classes?.[0]?._id}
          teacherData={teacherData}
          handleBackToDashboard={() => setCurrentView("dashboard")}
          // Add any missing props that the ClassDetails component might need
          // For example, if it requires a full list of classes:
          classes={teacherData?.classes || []}
        />
      );
    }

    if (currentView === "upcomingEvents") {
      return (
        <div className="p-6">
          <UpcomingEvents
            showBackButton={false}
            title="Upcoming Events" 
          />
        </div>
      );
    }

    if (currentView === "facultyReports") {
      return (
        <div className="p-6">
          <FacultyReportPage />
        </div>
      );
    }
  
    // Default to dashboard content
    return (
      <div className="p-4 lg:p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {/* Pending Reviews Card */}
          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <h3 className="text-base lg:text-lg font-semibold text-gray-700">Pending Reviews</h3>
              <Bell className="h-5 w-5 lg:h-6 lg:w-6 text-blue-500" />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-gray-900">
              {events.filter(event => event.status === "Pending").length}
            </p>
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs lg:text-sm text-gray-500">Awaiting your feedback</p>
              {events.filter(event => event.status === "Pending").length > 0 && (
                <button 
                  onClick={() => document.getElementById('events-section').scrollIntoView({ behavior: 'smooth' })}
                  className="text-sm text-blue-500 hover:text-blue-700 font-medium"
                >
                  Review Now →
                </button>
              )}
            </div>
          </div>
        
          {/* Class Participation Card */}
          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <h3 className="text-base lg:text-lg font-semibold text-gray-700">Active Students</h3>
              <Users className="h-5 w-5 lg:h-6 lg:w-6 text-green-500" />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-gray-900">
              {teacherData?.classes?.reduce((total, cls) => total + (cls.students?.length || 0), 0) > 0 
                ? `${Math.round((events.reduce((unique, event) => {
                    unique.add(event.submittedBy._id);
                    return unique;
                  }, new Set()).size / teacherData?.classes?.reduce((total, cls) => total + (cls.students?.length || 0), 0)) * 100)}%` 
                : "N/A"
              }
            </p>
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs lg:text-sm text-gray-500">Students with submissions</p>
              <button 
                onClick={() => setCurrentView("classList")}
                className="text-sm text-blue-500 hover:text-blue-700 font-medium"
              >
                View Class →
              </button>
            </div>
          </div>
        
          {/* Student Engagement Card */}
          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <h3 className="text-base lg:text-lg font-semibold text-gray-700">Inactive Students</h3>
              <Calendar className="h-5 w-5 lg:h-6 lg:w-6 text-red-500" />
            </div>
            {/* Calculate inactive students (no activity in 30+ days) */}
            <p className="text-2xl lg:text-3xl font-bold text-gray-900">
              {getInactiveStudentCount()}
            </p>
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs lg:text-sm text-gray-500">No activity in 30+ days</p>
              {getInactiveStudentCount() > 0 && (
                <button 
                  onClick={() => setCurrentView("facultyReports")}
                  className="text-sm text-blue-500 hover:text-blue-700 font-medium"
                >
                  View Reports →
                </button>
              )}
            </div>
          </div>
        </div>
  
        {/* Events Section */}
        <div id="events-section" className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Bell className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800">Events to Review</h2>
            </div>
          </div>
  
          <div className="p-6">
            {events.length > 0 ? (
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-lg text-gray-900">{event.submittedBy.name}</h3>
                      <p className="text-gray-600">{event.eventName}</p>
                      <p className="text-sm text-gray-500">
                        {formatEventDate(event)}
                      </p>
                    </div>
                    <div className="ml-4 flex gap-4 items-center">
                      {/* Add Certificate Proof button */}
                      <button
                        onClick={() => handleShowImage(event)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Show Certificate Proof
                      </button>
                      
                      <button
                        onClick={() => handleShowPDF(event)}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Show PDF Proof
                      </button>
  
                      {event.status === "Pending" ? (
                        <button
                          onClick={() => handleCheckNow(event)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          Check Now
                        </button>
                      ) : (
                        <div
                          className={`flex items-center ${
                            event.status === "Approved" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          <CheckCircle className="h-5 w-5 mr-2" />
                          {event.status}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-600 mb-2">No events to review</p>
                <p className="text-sm text-gray-500">
                  {teacherData?.classes && teacherData.classes.length > 0 
                    ? `You have ${teacherData.classes.length} class(es) assigned, but no pending events.` 
                    : "No classes are assigned to you yet. Events will appear when students from your classes submit them."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg p-4 lg:p-6">
        <div className="flex flex-col h-full">
          <h1 className="text-xl font-bold text-gray-800 mb-8">Teacher Portal</h1>
          <nav className="flex flex-col gap-4">
            <button
              onClick={() => setCurrentView("dashboard")}
              className={`flex items-center gap-2 p-3 rounded-lg hover:bg-gray-100 transition-colors ${
                currentView === "dashboard" ? "bg-gray-100" : ""
              }`}
            >
              <Bell size={18} />
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView("profile")}
              className={`flex items-center gap-2 p-3 rounded-lg hover:bg-gray-100 transition-colors ${
                currentView === "profile" ? "bg-gray-100" : ""
              }`}
            >
              <User size={18} />
              Profile
            </button>
            <button
              onClick={() => setCurrentView("classList")}
              className={`flex items-center gap-2 p-3 rounded-lg hover:bg-gray-100 transition-colors ${
                currentView === "classList" ? "bg-gray-100" : ""
              }`}
            >
              <Users size={18} />
              Class List
            </button>
            <button
              onClick={() => setCurrentView("facultyReports")}
              className={`flex items-center gap-2 p-3 rounded-lg hover:bg-gray-100 transition-colors ${
                currentView === "facultyReports" ? "bg-gray-100" : ""
              }`}
            >
              <BarChart3 size={18} />
              Faculty Reports
            </button>
            {/* Update this button to navigate directly to the new route */}
            <button
              onClick={() => setCurrentView("upcomingEvents")}
              className={`flex items-center gap-2 p-3 rounded-lg hover:bg-gray-100 transition-colors ${
                currentView === "upcomingEvents" ? "bg-gray-100" : ""
              }`}
            >
              <Calendar size={18} />
              Upcoming Events
            </button>
            <button
              onClick={handleLogoutClick}
              className="flex items-center w-full p-3 bg-red-500 text-white mt-3 rounded-lg hover:bg-red-600"
            >
              <LogOut size={18} />
              Logout
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">{renderContent()}</div>

      {/* Replace the current hardcoded event modal with this dynamic version */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 border-b pb-2">Review Event</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Dynamic rendering of all event details */}
              <div>
                <h4 className="font-semibold text-lg mb-3 text-blue-700">Basic Information</h4>
                {selectedEvent.submittedBy && (
                  <p><strong>Student:</strong> {selectedEvent.submittedBy.name}</p>
                )}
                
                {/* Dynamically render all non-excluded properties */}
                {Object.entries(selectedEvent).map(([key, value]) => {
                  // Skip certain properties we don't want to display
                  const excludedProps = ['_id', '__v', 'submittedBy', 'proofUrl', 'pdfDocument', 
                                        'customAnswers', 'dynamicFields', 'createdAt', 'updatedAt'];
                  
                  // Skip empty values, functions, and excluded properties
                  if (excludedProps.includes(key) || value === null || value === undefined || 
                      typeof value === 'function' || typeof value === 'object') {
                    return null;
                  }
                  
                  // Format the key for display (camelCase to Title Case)
                  const formattedKey = key.replace(/([A-Z])/g, ' $1')
                                          .replace(/^./, str => str.toUpperCase());
                  
                  return (
                    <p key={key}><strong>{formattedKey}:</strong> {value.toString()}</p>
                  );
                })}
              </div>
              
              {/* Show nested objects separately */}
              <div>
                <h4 className="font-semibold text-lg mb-3 text-blue-700">Additional Details</h4>
                
                {/* Handle date fields specially */}
                {selectedEvent.date && (
                  <p><strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString()}</p>
                )}
                {selectedEvent.createdAt && (
                  <p><strong>Created:</strong> {new Date(selectedEvent.createdAt).toLocaleString()}</p>
                )}
                {selectedEvent.updatedAt && (
                  <p><strong>Updated:</strong> {new Date(selectedEvent.updatedAt).toLocaleString()}</p>
                )}
                
                {/* Display nested objects */}
                {Object.entries(selectedEvent).map(([key, value]) => {
                  // Only process objects that aren't arrays and aren't null
                  if (typeof value !== 'object' || value === null || Array.isArray(value) || 
                      ['submittedBy', 'customAnswers', 'dynamicFields'].includes(key)) {
                    return null;
                  }
                  
                  // Format the key for display
                  const formattedKey = key.replace(/([A-Z])/g, ' $1')
                                          .replace(/^./, str => str.toUpperCase());
                  
                  return (
                    <div key={key} className="mb-2">
                      <strong>{formattedKey}:</strong>
                      <ul className="pl-5 mt-1">
                        {Object.entries(value).map(([nestedKey, nestedValue]) => {
                          if (nestedKey === '_id' || typeof nestedValue === 'function') return null;
                          
                          const formattedNestedKey = nestedKey.replace(/([A-Z])/g, ' $1')
                                                            .replace(/^./, str => str.toUpperCase());
                          
                          return (
                            <li key={nestedKey}>{formattedNestedKey}: {nestedValue.toString()}</li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Only show one of the fields sections to avoid duplication */}
            {selectedEvent.dynamicFields && Object.keys(selectedEvent.dynamicFields).length > 0 ? (
              <div className="mb-6">
                <h4 className="font-semibold text-lg mb-3 text-blue-700">Event Details</h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  {Object.entries(selectedEvent.dynamicFields).map(([key, value]) => {
                    // Remove the customAnswer_ prefix
                    const cleanKey = key.replace('customAnswer_', '');
                    
                    // Format to Title Case (first letter of each word capitalized)
                    const formattedKey = cleanKey
                      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
                      .replace(/_/g, ' ') // Replace underscores with spaces
                      .replace(/^./, str => str.toUpperCase()); // Capitalize first letter
                    
                    return (
                      <p key={key}><strong>{formattedKey}:</strong> {value.toString()}</p>
                    );
                  })}
                </div>
              </div>
            ) : (
              // Fallback to customAnswers if dynamicFields is not available
              selectedEvent.customAnswers && Object.keys(selectedEvent.customAnswers).length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-lg mb-3 text-blue-700">Event Details</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    {Object.entries(selectedEvent.customAnswers).map(([key, value]) => {
                      // Format the key to Title Case
                      const formattedKey = key
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/_/g, ' ')
                        .replace(/^./, str => str.toUpperCase());
                      
                      return (
                        <p key={key}><strong>{formattedKey}:</strong> {value.toString()}</p>
                      );
                    })}
                  </div>
                </div>
              )
            )}
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button 
                onClick={handleApprove}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Approve
              </button>
              <button 
                onClick={handleReject}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for viewing PDF */}
      {selectedPDF && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full h-3/4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">PDF Document</h3>
              <button 
                onClick={handleClosePDFModal}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            <iframe 
              src={selectedPDF} 
              className="w-full h-full" 
              title="PDF Viewer"
            ></iframe>
          </div>
        </div>
      )}

      {/* New modal for viewing certificate image */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Certificate Image</h3>
              <button 
                onClick={handleCloseImageModal}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            <div className="overflow-auto">
              <img 
                src={selectedImage} 
                className="w-full object-contain" 
                alt="Certificate" 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;