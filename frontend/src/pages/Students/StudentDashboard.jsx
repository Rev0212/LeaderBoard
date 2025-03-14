import React, { useState, useEffect } from "react";
import { Trophy, Calendar, Plus, Medal, User, LogOut, Menu, X, History, ExternalLink, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LeaderboardTable from "../../components/LeaderBoard";

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [rank, setRank] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        setError("Failed to load student data.");
        navigate("/student-login");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
    fetchUpcomingEvents();
    fetchRank();
  }, []);

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

  const handleAddEventClick = () => {
    navigate("/event-submit");
    setIsMobileMenuOpen(false);
  };

  const handleLogoutClick = async () => {
    try {
      const token = localStorage.getItem("student-token");
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

  const handleUpcomingEvents = () => {
    navigate("/upcoming-events");
    setIsMobileMenuOpen(false);
  };

  const handleProfileClick =() => {
    navigate('/student-profile');
    setIsMobileMenuOpen(false);
  }

  const Sidebar = () => (
    <div className={`
      ${windowWidth >= 1024 
        ? 'fixed left-0 top-0 h-full w-64 bg-white shadow-lg p-6 z-20' 
        : `fixed z-50 top-0 left-0 w-64 h-full bg-white shadow-lg p-6 transform transition-transform duration-300 ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`
      }
    `}>
      <div className="flex flex-col justify-start">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Student Portal</h1>
        <nav className="space-y-2 flex-grow">
          {[
            { icon: User, label: 'Profile', action:handleProfileClick },
            { icon: History, label: 'Event History', view: 'eventHistory' },
            { icon: CalendarDays, label: 'Upcoming Events', action: handleUpcomingEvents },
            { icon: Plus, label: 'Submit Participation', action: handleAddEventClick },
          ].map(({ icon: Icon, label, view, action }) => (
            <button
              key={label}
              onClick={() => {
                view ? setCurrentView(view) : action();
                windowWidth < 1024 && setIsMobileMenuOpen(false);
              }}
              className={`
                flex items-center w-full p-3 rounded-lg hover:bg-gray-100 
                ${currentView === view ? 'bg-gray-100' : ''}
              `}
            >
              <Icon className="mr-3" size={20} />
              {label}
            </button>
          ))}
        </nav>
        <button 
          onClick={handleLogoutClick}
          className="flex items-center w-full p-3 bg-red-500 text-white mt-3 rounded-lg hover:bg-red-600"
        >
          <LogOut className="mr-3" size={20} />
          Logout
        </button>
      </div>
    </div>
  );

  const UpcomingEventsSection = () => (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-800">Upcoming Events</h2>
        </div>
        <button
          onClick={handleUpcomingEvents}
          className="text-blue-500 hover:text-blue-600 text-sm"
        >
          View All
        </button>
      </div>
      
      <div className="space-y-3">
        {upcomingEvents.length > 0 ? (
          upcomingEvents.slice(0, 3).map((event) => (
            <div
              key={event._id}
              className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col gap-2">
                <div>
                  <h3 className="font-medium text-gray-900">{event.eventName}</h3>
                  <p className="text-sm text-gray-500">{event.category}</p>
                </div>
                <div className="flex items-center justify-between">
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
  );

  const DashboardContent = () => {
    if (loading) return <div className="text-center py-10">Loading...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

    return (
      <div className="p-6 lg:ml-64 bg-gray-50 min-h-screen">
        {windowWidth < 1024 && (
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            {/* <h1 className="text-xl font-bold">Student Dashboard</h1> */}
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { 
              icon: Calendar, 
              title: 'Event ✅', 
              value: studentData?.eventsParticipated?.length || 0,
              color: 'text-blue-500' 
            },
            { 
              icon: Trophy, 
              title: 'Current Rank', 
              value: `#${rank?.rank || 'N/A'}`, 
              color: 'text-yellow-500' 
            },
            { 
              icon: Medal, 
              title: 'Total Points', 
              value: studentData?.totalPoints || 0,
              color: 'text-purple-500' 
            }
          ].map(({ icon: Icon, title, value, color }) => (
            <div key={title} className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-semibold text-gray-700">{title}</h3>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <UpcomingEventsSection />
          </div>
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md">
            <LeaderboardTable />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {windowWidth >= 1024 && <Sidebar />}
      {windowWidth < 1024 && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      {windowWidth < 1024 && isMobileMenuOpen && <Sidebar />}
      <DashboardContent />
    </div>
  );
};

export default StudentDashboard;