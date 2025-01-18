import React, { useState, useEffect } from 'react';
import {useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Bell, CheckCircle, User, ArrowLeft } from 'lucide-react';
import EventDetailsModal from '../../components/EventDetailModel';
import TeacherProfile from '../../components/TeacherProfile'; // Import the TeacherProfile component
import ClassDetails from '../../components/ClassList'; // Import the ClassDetails component

const TeacherDashboard = () => {
  const [events, setEvents] = useState([]);
  const [teacherData, setTeacherData] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showProfile, setShowProfile] = useState(false); // State to show profile
  const [selectedPDF, setSelectedPDF] = useState(null); // State for selected PDF
  const [showClassList, setShowClassList] = useState(false); // State to show class list

  const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;
  const location = useLocation();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${VITE_BASE_URL}/event`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });
        setEvents(response.data);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, [VITE_BASE_URL]);

  useEffect(() => {
    const fetchTeacherProfile = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/teacher/profile`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        setTeacherData(response.data);
      } catch (error) {
        console.error("Error fetching teacher profile:", error);
      }
    };

    fetchTeacherProfile();
  }, []);

  useEffect(() => {
    // Check if we're returning from student view
    if (location.state?.showClassList) {
      setShowClassList(true);
    }
  }, [location]);

  const navigate = useNavigate();

  const haandleLogoutClick = async () => { 
    const token = localStorage.getItem("token"); 
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

  const handleApprove = () => {
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event._id === selectedEvent._id ? { ...event, status: 'Approved' } : event
      )
    );
    handleCloseModal();
  };

  const handleReject = () => {
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event._id === selectedEvent._id ? { ...event, status: 'Rejected' } : event
      )
    );
    handleCloseModal();
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
    // Ensure the PDF document exists before opening it in the modal
    if (event.pdfDocument) {
      const pdfUrl = `http://localhost:4000/uploads/pdf/${event.pdfDocument}`;
      setSelectedPDF(pdfUrl);  // Set the PDF URL to the state
    } else {
      console.error('No PDF document available for this event');
    }
  };

  const handleClosePDFModal = () => {
    setSelectedPDF(null);
  };

  if (showProfile) {
    return (
      <TeacherProfile
        teacherData={teacherData}
        handleBackToDashboard={handleBackToDashboard}
      />
    );
  }

  if (showClassList && teacherData) {
    return (
      <ClassDetails
        classId={teacherData?.classes?.[0]?._id}
        teacherData={teacherData}
        handleBackToDashboard={handleBackToDashboard}
      />
    );
  }

  const handleReportsClick = () => {
    navigate("/reports");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header with Profile, Class List, and Logout */}
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Teacher Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={handleShowProfile}
              className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <User size={20} />
              Profile
            </button>
          </div>
          <div className="relative">
            <button
              onClick={handleShowClassList}
              className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              Class List
            </button>
          </div>
          <div className="relative">
            <button
              onClick={handleReportsClick}
              className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow hover:shadow-md transition-shadow"
            >
             Reports
            </button>
          </div>
          <button
            onClick={haandleLogoutClick}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Events Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-6">
          <Bell className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">Events to Review</h2>
        </div>

        <div className="space-y-4">
          {events.length > 0 ? (
            events.map((event) => (
              <div
                key={event._id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-lg text-gray-900">{event.submittedBy.name}</h3>
                  <p className="text-gray-600">{event.eventName}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(event.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="ml-4 flex gap-4 items-center">
                  <button
                    onClick={() => handleShowPDF(event)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Show PDF Proof
                  </button>

                  {event.status === 'Pending' ? (
                    <button
                      onClick={() => handleCheckNow(event)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Check Now
                    </button>
                  ) : event.status === 'Approved' ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Approved
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Rejected
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600">No events to review</p>
          )}
        </div>
      </div>

      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        onClose={handleCloseModal}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {/* PDF Modal */}
      {selectedPDF && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full relative">
            {/* Close Button */}
            <button
              onClick={handleClosePDFModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <span className="text-xl font-bold">×</span> {/* Cross icon */}
            </button>
            <div className="pdf-container">
              <iframe
                src={selectedPDF} // Directly using the URL stored in selectedPDF
                width="100%"
                height="500px"
                title="Event PDF"
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
