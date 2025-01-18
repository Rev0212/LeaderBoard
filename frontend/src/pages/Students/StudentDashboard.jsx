import React, { useState, useEffect } from "react";
import { Trophy, Calendar, Plus, Medal, User, LogOut, CalendarDays, History, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LeaderboardTable from "../../components/LeaderBoard";
import EventsList from "../../components/EventsList";
import StudentProfile from "../../components/StudentProfile";
import StudentEventHistory from "../../components/StudentEventHistory";

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEventsList, setShowEventsList] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showEventHistory, setShowEventHistory] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const response = await axios.get(`${VITE_BASE_URL}/student/profile`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("student-token")}`,
            "Content-Type": "application/json",
          },
        });
        setStudentData(response.data);
      } catch (err) {
        console.error("Error fetching student data:", err);
        setError("Failed to load student data. Please try again later.");
        navigate("/student-login");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const response = await axios.get(`${VITE_BASE_URL}/upcoming-events`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("student-token")}`,
            "Content-Type": "application/json",
          },
        });
        setUpcomingEvents(response.data);
      } catch (err) {
        console.error("Error fetching upcoming events:", err);
      }
    };

    fetchUpcomingEvents();
  }, []);

  const handleAddEventClick = () => {
    navigate("/event-submit");
  };

  const handleLogoutClick = async () => {
    const token = localStorage.getItem("student-token");
    try {
    const response = await axios.get(`${VITE_BASE_URL}/student/logout`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if(response.status === 200) {
     localStorage.removeItem("student-token");
     navigate("/student-login");
    }
  }
  catch(err) {
    console.error("Error logging out:", err);
  }
};

  const handleShowEvents = () => {
    setShowEventsList(true);
  };

  const handleBackToDashboard = () => {
    setShowEventsList(false);
    setShowProfile(false);
  };

  const handleShowProfile = () => {
    setShowProfile(true);
  };

  const handleUpcomingEvents = () => {
    navigate("/upcoming-events");
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Student Portal</h1>
        <nav className="space-y-4">
          <button
            onClick={handleShowProfile}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <User size={20} />
            Profile
          </button>
          <button
            onClick={() => setShowEventHistory(true)}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <History size={20} />
            Event History
          </button>
          <button
            onClick={handleUpcomingEvents}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <CalendarDays size={20} />
            Upcoming Events
          </button>
          <button
            onClick={handleAddEventClick}
            className="w-full flex items-center gap-3 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus size={20} />
            Add Event
          </button>
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-3 p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors mt-auto"
          >
            <LogOut size={20} />
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Events Participated</h3>
              <Calendar className="h-6 w-6 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{studentData?.eventsParticipated?.length || 0}</p>
            <p className="text-sm text-gray-500 mt-2">
              Recent: {studentData?.eventsParticipated?.[0]?.eventName || "N/A"}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Current Rank</h3>
              <Trophy className="h-6 w-6 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">#{studentData?.currentRank || "N/A"}</p>
            <p className="text-sm text-gray-500 mt-2">Out of {studentData?.totalStudents || 0} students</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Total Points</h3>
              <Medal className="h-6 w-6 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{studentData?.totalPoints || 0}</p>
            <p className="text-sm text-gray-500 mt-2">Points accumulated</p>
          </div>
        </div>

        {/* New Upcoming Events Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Upcoming Events */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-6 w-6 text-blue-500" />
                <h2 className="text-xl font-semibold text-gray-800">Upcoming Events</h2>
              </div>
              <button
                onClick={handleUpcomingEvents}
                className="text-blue-500 hover:text-blue-600 text-sm"
              >
                View All
              </button>
            </div>
            
            <div className="space-y-4">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.slice(0, 3).map((event) => (
                  <div
                    key={event._id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors h-[100px] flex items-center"
                  >
                    <div className="flex-1 flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium text-gray-900">{event.eventName}</h3>
                            <p className="text-sm text-gray-500">{event.category}</p>
                          </div>
                          <span className="text-sm font-medium text-blue-500">
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        <a
                          href={event.registrationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Register Now
                          <ExternalLink size={16} />
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No upcoming events</p>
              )}
            </div>
          </div>

          {/* Leaderboard Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Leaderboard</h2>
            <LeaderboardTable />
          </div>
        </div>
      </div>

      {/* Conditional Renders */}
      {showEventsList && (
        <EventsList studentData={studentData} handleBackToDashboard={handleBackToDashboard} />
      )}
      {showProfile && (
        <StudentProfile studentData={studentData} handleBackToDashboard={handleBackToDashboard} />
      )}
      {showEventHistory && (
        <StudentEventHistory
          studentData={studentData}
          handleBackToDashboard={() => setShowEventHistory(false)}
        />
      )}
    </div>
  );
};

export default StudentDashboard;
