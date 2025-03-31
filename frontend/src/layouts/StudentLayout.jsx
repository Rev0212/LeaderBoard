// src/layouts/StudentLayout.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { User, History, CalendarDays, Plus, LogOut, Menu, X, LayoutDashboard } from "lucide-react";
import axios from "axios";

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

const StudentLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Check if a route is active
  const isRouteActive = (path) => {
    return location.pathname === path;
  };

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
            { icon: LayoutDashboard, label: 'Dashboard', path: '/student-dashboard' },
            { icon: User, label: 'Profile', path: '/student-profile' },
            { icon: History, label: 'Event History', path: '/student-events' },
            { icon: CalendarDays, label: 'Upcoming Events', path: '/upcoming-events' },
            { icon: Plus, label: 'Submit Participation', path: '/event-submit' },
          ].map(({ icon: Icon, label, path }) => (
            <button
              key={label}
              onClick={() => {
                navigate(path);
                windowWidth < 1024 && setIsMobileMenuOpen(false);
              }}
              className={`
                flex items-center w-full p-3 rounded-lg hover:bg-gray-100 
                ${isRouteActive(path) ? 'bg-gray-100 font-medium text-blue-600' : ''}
              `}
            >
              <Icon className={`mr-3 ${isRouteActive(path) ? 'text-blue-600' : ''}`} size={20} />
              {label}
            </button>
          ))}
        </nav>
        <button 
          onClick={() => {
            handleLogoutClick();
            windowWidth < 1024 && setIsMobileMenuOpen(false);
          }}
          className="flex items-center w-full p-3 bg-red-500 text-white mt-3 rounded-lg hover:bg-red-600"
        >
          <LogOut className="mr-3" size={20} />
          Logout
        </button>
      </div>
    </div>
  );

  // Mobile navbar
  const MobileNav = () => (
    <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-md p-4 z-30 flex justify-between items-center">
      <h1 className="font-bold text-lg">Student Portal</h1>
      <button onClick={() => setIsMobileMenuOpen(true)}>
        <Menu size={24} />
      </button>
    </div>
  );

  return (
    <div className="flex">
      {windowWidth >= 1024 && <Sidebar />}
      {windowWidth < 1024 && <MobileNav />}
      {windowWidth < 1024 && isMobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <Sidebar />
        </>
      )}
      
      <div className={`
        ${windowWidth >= 1024 ? 'ml-64' : 'mt-16'} 
        min-h-screen w-full bg-gray-50 px-4 py-6 md:p-6
      `}>
        <Outlet />
      </div>
    </div>
  );
};

export default StudentLayout;