import React, { useState, useEffect } from "react";
import { Trophy, Calendar, Plus, Medal, User, LogOut, CalendarDays, History } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LeaderboardTable from "../../components/LeaderBoard";
import EventsList from "../../components/EventsList"; // Import the new component
import StudentProfile from "../../components/StudentProfile"; 
import StudentEventHistory from "../../components/StudentEventHistory";
const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEventsList, setShowEventsList] = useState(false);
  const [showProfile, setShowProfile] = useState(false); // State to show profile
  const [showEventHistory, setShowEventHistory] = useState(false);

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
    setShowProfile(false); // Hide profile when back to dashboard
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

  if (showEventsList) {
    return (
      <EventsList
        studentData={studentData}
        handleBackToDashboard={handleBackToDashboard}
      />
    );
  }

  if (showProfile) {
    return (
      <StudentProfile
        studentData={studentData}
        handleBackToDashboard={handleBackToDashboard}
      />
    );
  }

  if (showEventHistory) {
    return (
      <StudentEventHistory
        studentData={studentData}
        handleBackToDashboard={() => setShowEventHistory(false)}
      />
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setShowEventHistory(true)}
            className="border border-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-gray-100"
          >
            <History size={20} />
            Event History
          </button>
          <button
            onClick={handleShowProfile}
            className="border border-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-gray-100"
          >
            <User size={20} />
            Profile
          </button>

          <button
            onClick={handleAddEventClick}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600"
          >
            <Plus size={20} />
            Add Event
          </button>

          <button onClick={handleLogoutClick} className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-600">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className="border p-4 rounded-lg shadow cursor-pointer"
          onClick={handleShowEvents}
        >
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-sm font-medium">Events Participated</h2>
            <Calendar className="h-4 w-4 text-gray-500" />
          </div>
          <div>
            <p className="text-2xl font-bold">
              {studentData?.eventsParticipated?.length || 0}
            </p>
            <p className="text-xs text-gray-500">
              Recent Event: {studentData?.eventsParticipated?.[0]?.eventName || "N/A"}
            </p>
          </div>
        </div>

        <div className="border p-4 rounded-lg shadow">
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-sm font-medium">Current Rank</h2>
            <Trophy className="h-4 w-4 text-gray-500" />
          </div>
          <div>
            <p className="text-2xl font-bold">
              #{studentData?.currentRank || "N/A"}
            </p>
            <p className="text-xs text-gray-500">
              Out of {studentData?.totalStudents || 0} students
            </p>
          </div>
        </div>

        <div className="border p-4 rounded-lg shadow">
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-sm font-medium">Total Points</h2>
            <Medal className="h-4 w-4 text-gray-500" />
          </div>
          <div>
            <p className="text-2xl font-bold">
              {studentData?.totalPoints || 0}
            </p>
          </div>
        </div>

        <div
          className="border p-4 rounded-lg shadow cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={handleUpcomingEvents}
        >
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-sm font-medium">Upcoming Events</h2>
            <CalendarDays className="h-4 w-4 text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">View</p>
            <p className="text-xs text-gray-500">
              Check upcoming college events
            </p>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
        <LeaderboardTable />
    </div>
  );
};


export default StudentDashboard;
