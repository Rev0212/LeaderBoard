import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Building,
  User,
  Users,
  LogOut,
  Hash,
  Layers,
  BarChart,
} from "lucide-react";
import AdvisorProfile from "../../components/advisor/AdvisorProfile";
import ClassesList from "../../components/advisor/ClassesList";
import ReportSection from "./ReportSection";

const AdvisorHodDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [classes, setClasses] = useState([]);
  const [currentView, setCurrentView] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("teacher-token");
        
        // Fetch user profile
        const profileResponse = await axios.get(`${VITE_BASE_URL}/teacher/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        const userData = profileResponse.data;
        setUserData(userData);
        
        // Fetch the appropriate classes based on role
        let classesResponse;
        if (userData.role === 'HOD') {
          classesResponse = await axios.get(`${VITE_BASE_URL}/teacher/department-classes`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
        } else {
          classesResponse = await axios.get(`${VITE_BASE_URL}/teacher/advised-classes`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
        }
        
        setClasses(classesResponse.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [VITE_BASE_URL]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("teacher-token");
      await axios.get(`${VITE_BASE_URL}/teacher/logout`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      localStorage.removeItem("teacher-token");
      navigate("/teacher-login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleReportsClick = () => {
    // Option 1: Change view within the dashboard
    setCurrentView("reports");
    
    // Option 2: Navigate to dedicated reports page
    // navigate("/reports");
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (currentView === "profile") {
      return (
        <AdvisorProfile
          userData={userData}
          handleBackToDashboard={() => setCurrentView("dashboard")}
        />
      );
    }

    if (currentView === "classes") {
      return (
        <ClassesList
          classes={classes}
          handleBackToDashboard={() => setCurrentView("dashboard")}
        />
      );
    }

    if (currentView === "reports") {
      return (
        <ReportSection 
          handleBackToDashboard={() => setCurrentView("dashboard")} 
        />
      );
    }

    // Default dashboard view
    return (
      <div className="p-4 lg:p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {/* Department Info */}
          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <h3 className="text-base lg:text-lg font-semibold text-gray-700">Department</h3>
              <Building className="h-5 w-5 lg:h-6 lg:w-6 text-blue-500" />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-gray-900">
              {userData?.department || "N/A"}
            </p>
            <p className="text-xs lg:text-sm text-gray-500 mt-2">Current Department</p>
          </div>
        
          {/* Role Info */}
          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <h3 className="text-base lg:text-lg font-semibold text-gray-700">Role</h3>
              <User className="h-5 w-5 lg:h-6 lg:w-6 text-green-500" />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-gray-900">
              {userData?.role || "N/A"}
            </p>
            <p className="text-xs lg:text-sm text-gray-500 mt-2">{userData?.role === "HOD" ? "Head of Department" : "Academic Advisor"}</p>
          </div>
        
          {/* Classes Managed */}
          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <h3 className="text-base lg:text-lg font-semibold text-gray-700">Classes</h3>
              <Layers className="h-5 w-5 lg:h-6 lg:w-6 text-purple-500" />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-gray-900">
              {classes?.length || 0}
            </p>
            <p className="text-xs lg:text-sm text-gray-500 mt-2">
              {userData?.role === "HOD" ? "Departmental Classes" : "Classes Managed"}
            </p>
          </div>
        </div>
        
        {/* Classes Overview Section */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">Classes Overview</h2>
              </div>
              <button
                onClick={() => setCurrentView("classes")}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All Classes
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {classes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classes.slice(0, 6).map((classItem) => (
                  <div
                    key={classItem._id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/advisor-hod/class/${classItem._id}`)}
                  >
                    <h3 className="font-medium text-lg text-gray-900">
                      {classItem.className || `${classItem.year}-${classItem.section}`}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {classItem.department} • {classItem.academicYear}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {classItem.students?.length || 0} Students
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No classes found.</p>
                {userData?.role === "HOD" ? (
                  <p className="text-sm text-gray-400 mt-2">Classes for your department will appear here.</p>
                ) : (
                  <p className="text-sm text-gray-400 mt-2">Classes assigned to you will appear here.</p>
                )}
              </div>
            )}
            
            {classes.length > 6 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setCurrentView("classes")}
                  className="text-blue-600 hover:text-blue-800"
                >
                  View all {classes.length} classes
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Reports Overview Section */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">Reports Overview</h2>
              </div>
              <button
                onClick={() => setCurrentView("reports")}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All Reports
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                   onClick={() => setCurrentView("reports")}>
                <h3 className="font-medium text-gray-900">Performance Reports</h3>
                <p className="text-sm text-gray-500 mt-1">Analyze student performance across classes</p>
              </div>
              <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                   onClick={() => setCurrentView("reports")}>
                <h3 className="font-medium text-gray-900">Participation Reports</h3>
                <p className="text-sm text-gray-500 mt-1">Event participation statistics by class</p>
              </div>
              <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                   onClick={() => setCurrentView("reports")}>
                <h3 className="font-medium text-gray-900">Leaderboard Stats</h3>
                <p className="text-sm text-gray-500 mt-1">Top performing students and classes</p>
              </div>
            </div>
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
          <h1 className="text-xl font-bold text-gray-800 mb-8">
            {userData?.role === "HOD" ? "HOD Portal" : "Advisor Portal"}
          </h1>
          <nav className="flex flex-col gap-4">
            <button
              onClick={() => setCurrentView("dashboard")}
              className={`flex items-center gap-2 p-3 rounded-lg hover:bg-gray-100 transition-colors ${
                currentView === "dashboard" ? "bg-gray-100" : ""
              }`}
            >
              <Building size={18} />
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
              onClick={() => setCurrentView("classes")}
              className={`flex items-center gap-2 p-3 rounded-lg hover:bg-gray-100 transition-colors ${
                currentView === "classes" ? "bg-gray-100" : ""
              }`}
            >
              <Users size={18} />
              Classes
            </button>
            <button
              onClick={() => setCurrentView("reports")}
              className={`flex items-center gap-2 p-3 rounded-lg hover:bg-gray-100 transition-colors ${
                currentView === "reports" ? "bg-gray-100" : ""
              }`}
            >
              <BarChart size={18} />
              Reports
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 p-3 rounded-lg hover:bg-red-100 transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">{renderContent()}</div>
    </div>
  );
};

export default AdvisorHodDashboard;