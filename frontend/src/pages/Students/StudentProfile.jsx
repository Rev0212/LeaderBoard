import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  User, Mail, Hash, Star, Calendar, ArrowLeft, 
  Camera, Trash2, Building, GraduationCap, BookOpen,
  Menu, X, LogOut, History, CalendarDays, Plus, Home
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentProfile = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    reenterNewPassword: ""
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  const navigate = useNavigate();
  const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const token = localStorage.getItem('student-token');
        if (!token) {
          navigate('/student-login');
          return;
        }
        
        const response = await axios.get(`${VITE_BASE_URL}/student/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setStudent(response.data);
        setProfileImg(response.data.profileImg || null);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching student profile:', err);
        setError('Failed to load profile data');
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, [VITE_BASE_URL, navigate]);

  const handleAddImage = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

      try {
        const cloudinaryResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const responseData = await cloudinaryResponse.json();
        
        if (responseData.secure_url) {
          const imageUrl = responseData.secure_url;

          setProfileImg(imageUrl);
          
          await axios.put(
            `${VITE_BASE_URL}/student/update-profile`,
            {
              profileImg: imageUrl
            },
            {
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("student-token")}`,
              },
            }
          );
        } else {
          throw new Error("Failed to get image URL from Cloudinary");
        }
      } catch (error) {
        console.error("Image upload failed:", error);
        setPasswordError("Failed to upload image. Please try again.");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleRemoveImage = async () => {
    setProfileImg(null);
    try {
      await axios.put(
        `${VITE_BASE_URL}/student/update-profile`,
        { profileImg: null },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("student-token")}`,
          },
        }
      );
    } catch (error) {
      console.error("Failed to remove profile image:", error);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
    setPasswordError("");
    setPasswordSuccess("");
  };

  const handleSubmitPasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordData.newPassword !== passwordData.reenterNewPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    try {
      await axios.put(
        `${VITE_BASE_URL}/student/change-password`,
        {
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("student-token")}`,
          },
        }
      );
      setPasswordSuccess("Password changed successfully");
      setTimeout(() => {
        setShowChangePasswordForm(false);
        setPasswordData({
          oldPassword: "",
          newPassword: "",
          reenterNewPassword: ""
        });
      }, 2000);
    } catch (error) {
      console.error("Error changing password:", error);
      setPasswordError("Failed to change password. Please try again.");
    }
  };

  const handleBackToDashboard = () => {
    navigate('/student-dashboard');
  };

  const handleAddEventClick = () => {
    navigate("/event-submit");
    setIsMobileMenuOpen(false);
  };

  const handleUpcomingEvents = () => {
    navigate("/upcoming-events");
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

  const handleEventHistory = () => {
    navigate("/student-dashboard", { state: { view: "eventHistory" } });
    setIsMobileMenuOpen(false);
  };

  // Sidebar component
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
            { icon: Home, label: 'Dashboard', action: () => navigate('/student-dashboard') },
            { icon: User, label: 'Profile', active: true },
            { icon: History, label: 'Event History', action: handleEventHistory },
            { icon: CalendarDays, label: 'Upcoming Events', action: handleUpcomingEvents },
            { icon: Plus, label: 'Submit Participation', action: handleAddEventClick },
          ].map(({ icon: Icon, label, action, active }) => (
            <button
              key={label}
              onClick={action}
              className={`
                flex items-center w-full p-3 rounded-lg 
                ${active ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}
              `}
              disabled={active}
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading student profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 w-full max-w-md">
          <p className="text-red-700">{error}</p>
          <button
            onClick={handleBackToDashboard}
            className="mt-4 flex items-center gap-2 text-blue-500"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile menu button */}
      {windowWidth < 1024 && (
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed top-4 left-4 z-40 bg-white p-2 rounded-full shadow-md"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      {/* Sidebar */}
      <Sidebar />

      {/* Overlay for mobile when sidebar is open */}
      {windowWidth < 1024 && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Main content */}
      <div className={`flex-1 ${windowWidth >= 1024 ? 'ml-64' : ''} p-4`}>
        <div className="max-w-3xl mx-auto mt-10">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
              <button
                onClick={() => setShowChangePasswordForm(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Change Password
              </button>
            </div>

            <div className={showChangePasswordForm ? 'opacity-50' : 'opacity-100'}>
              <div className="flex flex-col items-center gap-6 mb-8">
                <div className="relative">
                  {profileImg ? (
                    <div className="relative">
                      <img
                        src={profileImg}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
                      />
                      <button
                        onClick={handleRemoveImage}
                        className="absolute top-0 right-0 bg-red-500 text-white p-2 rounded-full"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center border-2 border-dashed border-gray-400">
                        {uploading ? (
                          <span className="text-gray-500">Uploading...</span>
                        ) : (
                          <Camera size={32} className="text-gray-500" />
                        )}
                      </div>
                      <input type="file" className="hidden" onChange={handleAddImage} />
                    </label>
                  )}
                </div>

                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-800">{student?.name || "N/A"}</h1>
                  <p className="text-gray-600">{student?.email || "N/A"}</p>
                </div>
              </div>

              <div className="space-y-6">
                <InfoRow icon={<User />} label="Full Name" value={student?.name} />
                <InfoRow icon={<Mail />} label="Email Address" value={student?.email} />
                <InfoRow icon={<Hash />} label="Register Number" value={student?.registerNo} />
                <InfoRow icon={<Building />} label="Department" value={student?.department} />
                <InfoRow icon={<GraduationCap />} label="Program" value={student?.program} />
                <InfoRow 
                  icon={<BookOpen />} 
                  label="Current Class" 
                  value={student?.currentClass?.section || "N/A"} 
                />
                <InfoRow 
                  icon={<Calendar />} 
                  label="Events Participated" 
                  value={student?.eventsParticipated?.filter(event => event.status === 'Approved')?.length || 0} 
                />
                <InfoRow 
                  icon={<Star />} 
                  label="Total Points" 
                  value={student?.totalPoints || 0} 
                />
              </div>
            </div> 

            {showChangePasswordForm && (
              <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                  <form onSubmit={handleSubmitPasswordChange} className="space-y-4">
                    <h2 className="text-2xl font-bold mb-6">Change Password</h2>
                    
                    {passwordError && (
                      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                        <p className="text-red-700">{passwordError}</p>
                      </div>
                    )}
                    
                    {passwordSuccess && (
                      <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                        <p className="text-green-700">{passwordSuccess}</p>
                      </div>
                    )}

                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">Current Password</label>
                      <input
                        type="password"
                        name="oldPassword"
                        value={passwordData.oldPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">Confirm New Password</label>
                      <input
                        type="password"
                        name="reenterNewPassword"
                        value={passwordData.reenterNewPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                        required
                      />
                    </div>

                    <div className="flex justify-between pt-6">
                      <button
                        type="button"
                        onClick={() => {
                          setShowChangePasswordForm(false);
                          setPasswordError("");
                          setPasswordSuccess("");
                        }}
                        className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Submit
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center space-x-4">
    <div className="bg-gray-100 p-3 rounded-full">
      {React.cloneElement(icon, { className: "h-6 w-6 text-gray-600" })}
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-lg font-semibold">{value || "N/A"}</p>
    </div>
  </div>
);

export default StudentProfile;