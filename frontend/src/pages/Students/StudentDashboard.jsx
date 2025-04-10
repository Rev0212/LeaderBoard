import React, { useState, useEffect } from "react";
import { Trophy, Calendar, Plus, Medal, User, LogOut, Menu, X, History, ExternalLink, CalendarDays, LayoutDashboard, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LeaderboardTable from "../../components/LeaderBoard";
import StudentEventHistory from "../../components/StudentEventHistory";
import UpcomingEventsList from "../../components/UpcomingEventsList";
import FeedbackForm from '../../components/FeedbackForm';
import { motion, AnimatePresence } from "framer-motion";

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

// Add these animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// First, update the iconSpin animation variant at the top of the file
const iconSpin = {
  initial: { rotate: 0 },
  animate: { 
    rotate: 360,
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: 0,
      repeatDelay: 0
    }
  }
};

// Add these new animation variants after the existing ones
const slideInRight = {
  initial: { x: 100, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const scaleIn = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.5 }
};

const pulseAnimation = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

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
      const response = await axios.get(`${VITE_BASE_URL}/leaderboard/my-rank`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("student-token")}`,
          "Content-Type": "application/json",
        },
      });
      console.log("Rank response:", response.data);
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
    navigate('/upcoming-events');
    setIsMobileMenuOpen(false);
  };

  const handleProfileClick =() => {
    navigate('/student-profile');
    setIsMobileMenuOpen(false);
  }

  const Sidebar = () => (
    <motion.div
      initial={windowWidth < 1024 ? { x: -300 } : false}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className={`
        ${windowWidth >= 1024 
          ? 'fixed left-0 top-0 h-full w-64 bg-white shadow-lg p-6 z-20' 
          : 'fixed z-50 top-0 left-0 w-64 h-full bg-white shadow-lg p-6'
        }
      `}
    >
      <div className="flex flex-col justify-start">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Student Portal</h1>
        <nav className="space-y-2 flex-grow">
          {[
            { icon: LayoutDashboard, label: 'Dashboard', view: 'dashboard' },
            { icon: User, label: 'Profile', action: () => navigate('/student-profile') },
            { icon: History, label: 'Event History', view: 'eventHistory' },
            { icon: CalendarDays, label: 'Upcoming Events', action: handleUpcomingEvents },
            { icon: Plus, label: 'Submit Participation', action: handleAddEventClick },
            { icon: MessageSquare, label: 'Feedback', view: 'feedback' },
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
    </motion.div>
  );

  const UpcomingEventsSection = () => (
    <motion.div 
      className="bg-white rounded-lg shadow-md p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
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
      
      <motion.div 
        className="space-y-3"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {upcomingEvents.length > 0 ? (
          upcomingEvents.slice(0, 3).map((event) => (
            <motion.div
              key={event._id}
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
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
            </motion.div>
          ))
        ) : (
          <motion.p 
            variants={fadeInUp}
            className="text-gray-500 text-center py-4"
          >
            No upcoming events
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );

  const DashboardContent = () => {
    if (loading) return <div className="text-center py-10">Loading...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

    if (currentView === "feedback") {
      return (
        <motion.div 
          className="bg-gray-50 min-h-screen p-6"
          variants={slideInRight}
          initial="initial"
          animate="animate"
        >
          <FeedbackForm />
        </motion.div>
      );
    }

    if (currentView === "eventHistory") {
      return (
        <motion.div 
          className="bg-gray-50 min-h-screen"
          variants={slideInRight}
          initial="initial"
          animate="animate"
        >
          <StudentEventHistory handleBackToDashboard={() => setCurrentView("dashboard")} />
        </motion.div>
      );
    }

    return (
      <div className="bg-gray-50 min-h-screen">
        {windowWidth < 1024 && (
          <motion.div 
            className="flex justify-between items-center mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.button 
              onClick={() => setIsMobileMenuOpen(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Menu size={24} />
            </motion.button>
          </motion.div>
        )}

        <motion.div 
          className="grid grid-cols-3 gap-3 mb-6"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
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
              value: rank ? ` ${rank.contextRank ? '#' + rank.contextRank : ''}` : 'Loading...', 
              color: 'text-yellow-500' 
            },
            { 
              icon: Medal, 
              title: 'Total Points', 
              value: studentData?.totalPoints || 0,
              color: 'text-purple-500' 
            }
          ].map(({ icon: Icon, title, value, color }) => (
            <motion.div
              key={title}
              variants={fadeInUp}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-semibold text-gray-700">{title}</h3>
                <motion.div 
                  initial="initial"
                  animate="animate"
                  variants={iconSpin}
                  whileHover={{ scale: 1.1 }}
                  key={title} // Add this to ensure unique animations
                >
                  <Icon className={`h-5 w-5 ${color}`} />
                </motion.div>
              </div>
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-2xl font-bold text-gray-900"
              >
                {value}
              </motion.p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div 
            variants={fadeInUp}
            className="lg:col-span-1"
          >
            <UpcomingEventsSection />
          </motion.div>
          <motion.div 
            variants={fadeInUp}
            className="lg:col-span-2 bg-white rounded-lg shadow-md"
            whileHover={{ 
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <LeaderboardTable />
            </motion.div>
          </motion.div>
        </motion.div>
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