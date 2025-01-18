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
  const [currentView, setCurrentView] = useState('dashboard');
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [rank, setRank] = useState(null);

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

  useEffect(() => {
    const fetchRank = async () => {
      try {
        const response = await axios.get(`${VITE_BASE_URL}/student/current-rank`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("student-token")}`,
            "Content-Type": "application/json",
          },
        });
        setRank(response.data);
      } catch (err) {
        console.error("Error fetching rank:", err);
      }
    };

    fetchRank();
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
      if (response.status === 200) {
        localStorage.removeItem("student-token");
        navigate("/student-login");
      }
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
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

  const renderDashboardContent = () => (
    <div className="lg:ml-64 p-4 lg:p-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-3 lg:mb-4">
            <h3 className="text-base lg:text-lg font-semibold text-gray-700">Events Participated</h3>
            <Calendar className="h-5 w-5 lg:h-6 lg:w-6 text-blue-500" />
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-gray-900">{studentData?.eventsParticipated?.length || 0}</p>
          <p className="text-xs lg:text-sm text-gray-500 mt-2">
            Recent: {studentData?.eventsParticipated?.[0]?.eventName || "N/A"}
          </p>
        </div>

        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-3 lg:mb-4">
            <h3 className="text-base lg:text-lg font-semibold text-gray-700">Current Rank</h3>
            <Trophy className="h-5 w-5 lg:h-6 lg:w-6 text-yellow-500" />
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-gray-900">
            #{rank?.rank || "N/A"}
          </p>
          <p className="text-xs lg:text-sm text-gray-500 mt-2">
            Out of {rank?.totalStudents || 0} students
          </p>
        </div>

        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-3 lg:mb-4">
            <h3 className="text-base lg:text-lg font-semibold text-gray-700">Total Points</h3>
            <Medal className="h-5 w-5 lg:h-6 lg:w-6 text-purple-500" />
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-gray-900">{studentData?.totalPoints || 0}</p>
          <p className="text-xs lg:text-sm text-gray-500 mt-2">Points accumulated</p>
        </div>
      </div>

      {/* Upcoming Events and Leaderboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
        {/* Upcoming Events */}
        <div className="xl:col-span-1 bg-white rounded-lg shadow-md p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 lg:h-6 lg:w-6 text-blue-500" />
              <h2 className="text-lg lg:text-xl font-semibold text-gray-800">Upcoming Events</h2>
            </div>
            <button
              onClick={handleUpcomingEvents}
              className="text-blue-500 hover:text-blue-600 text-sm"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-3 lg:space-y-4">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.slice(0, 3).map((event) => (
                <div
                  key={event._id}
                  className="p-3 lg:p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h3 className="font-medium text-gray-900">{event.eventName}</h3>
                      <p className="text-sm text-gray-500">{event.category}</p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <span className="text-sm font-medium text-blue-500">
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                      <a
                        href={event.registrationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Register
                        <ExternalLink size={14} />
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
        <div className="xl:col-span-2 bg-white rounded-lg shadow-md">
          <div className="h-full">
            <LeaderboardTable />
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'profile':
        return (
          <div className="lg:ml-64">
            <StudentProfile 
              studentData={studentData} 
              handleBackToDashboard={handleBackToDashboard} 
            />
          </div>
        );
      case 'eventHistory':
        return (
          <div className="lg:ml-64">
            <StudentEventHistory
              studentData={studentData}
              handleBackToDashboard={handleBackToDashboard}
            />
          </div>
        );
      default:
        return renderDashboardContent();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="lg:fixed lg:top-0 lg:left-0 lg:h-full lg:w-64 bg-white shadow-lg p-4 lg:p-6">
        <div className="flex lg:flex-col h-full">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800 mb-4 lg:mb-8">Student Portal</h1>
          <nav className="flex lg:flex-col gap-2 lg:gap-4">
            <button
              onClick={() => setCurrentView('profile')}
              className={`flex items-center gap-2 p-2 lg:p-3 rounded-lg hover:bg-gray-100 transition-colors text-sm lg:text-base ${
                currentView === 'profile' ? 'bg-gray-100' : ''
              }`}
            >
              <User size={18} />
              <span className="hidden lg:inline">Profile</span>
            </button>
            <button
              onClick={() => setCurrentView('eventHistory')}
              className={`flex items-center gap-2 p-2 lg:p-3 rounded-lg hover:bg-gray-100 transition-colors text-sm lg:text-base ${
                currentView === 'eventHistory' ? 'bg-gray-100' : ''
              }`}
            >
              <History size={18} />
              <span className="hidden lg:inline">Event History</span>
            </button>
            <button
              onClick={handleUpcomingEvents}
              className="flex items-center gap-2 p-2 lg:p-3 rounded-lg hover:bg-gray-100 transition-colors text-sm lg:text-base"
            >
              <CalendarDays size={18} />
              <span className="hidden lg:inline">Upcoming Events</span>
            </button>
            <button
              onClick={handleAddEventClick}
              className="flex items-center gap-2 p-2 lg:p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm lg:text-base"
            >
              <Plus size={18} />
              <span className="hidden lg:inline">Add Event</span>
            </button>
            <button
              onClick={handleLogoutClick}
              className="flex items-center gap-2 p-2 lg:p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm lg:text-base mt-auto"
            >
              <LogOut size={18} />
              <span className="hidden lg:inline">Logout</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      {renderContent()}
    </div>
  );
};

export default StudentDashboard;