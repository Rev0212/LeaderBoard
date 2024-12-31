import React, { useState } from "react";
import { Trophy, Calendar, Plus, Medal, User, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import {useNavigate} from "react-router-dom"
import LeaderboardTable from "../../components/LeaderBoard";

const StudentDashboard = () => {
  // Sample data
  const studentData = {
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    department: "Computer Science",
    studentId: "CS2024001",
    eventsParticipated: 12,
    currentRank: 5,
    totalStudents: 156,
    totalPoints:200,
    upcomingEvent: "Coding Challenge",
    leaderboard: [
      { name: "Sarah Smith", points: 2500, rank: 1 },
      { name: "John Doe", points: 2350, rank: 2 },
      { name: "Emma Wilson", points: 2200, rank: 3 },
      { name: "Alex Johnson", points: 2100, rank: 4 },
      { name: "Mike Brown", points: 2000, rank: 5 },
    ],
  };

  const navigate = useNavigate();

  const handleAddEventClick = () => {
    navigate("/event-submit");
  };


  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <div className="flex gap-4">
          <Link
            to="student-profile"
            className="border border-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-gray-100"
          >
            <User size={20} />
            Profile
          </Link>
         
          <button onClick={handleAddEventClick} className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600">
            <Plus size={20} />
            Add Event
          </button>

          <button className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-600">
              <LogOut size={20} />
              Logout
            </button>

        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border p-4 rounded-lg shadow">
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-sm font-medium">Events Participated</h2>
            <Calendar className="h-4 w-4 text-gray-500" />
          </div>
          <div>
            <p className="text-2xl font-bold">{studentData.eventsParticipated}</p>
            <p className="text-xs text-gray-500">
              Last event: {studentData.upcomingEvent}
            </p>
          </div>
        </div>

        <div className="border p-4 rounded-lg shadow">
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-sm font-medium">Current Rank</h2>
            <Trophy className="h-4 w-4 text-gray-500" />
          </div>
          <div>
            <p className="text-2xl font-bold">#{studentData.currentRank}</p>
            <p className="text-xs text-gray-500">
              Out of {studentData.totalStudents} students
            </p>
          </div>
        </div>

        <div className="border p-4 rounded-lg shadow">
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-sm font-medium">Total Points</h2>
            <Calendar className="h-4 w-4 text-gray-500" />
          </div>
          <div>
            <p className="text-2xl font-bold">{studentData.totalPoints}</p>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="border p-4 rounded-lg shadow"> 
        <LeaderboardTable/>
      </div>
    </div>
  );
};

export default StudentDashboard;
