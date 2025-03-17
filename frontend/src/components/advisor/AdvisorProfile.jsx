import React, { useState, useEffect } from "react";
import { ArrowLeft, Mail, Building, Phone, User, Calendar, Hash } from "lucide-react";
import axios from "axios";

const AdvisorProfile = ({ userData, handleBackToDashboard }) => {
  const [loading, setLoading] = useState(!userData);
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
  
  const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    if (userData && userData.profileImage) {
      setProfileImg(`${VITE_BASE_URL}/uploads/profile/${userData.profileImage}`);
    }
    setLoading(false);
  }, [userData, VITE_BASE_URL]);

  const handleAddImage = async (event) => {
    if (!event.target.files || !event.target.files[0]) return;
    
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("profileImage", file);
    
    try {
      setUploading(true);
      const token = localStorage.getItem("token");
      const response = await axios.put(`${VITE_BASE_URL}/teacher/add`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data.profileImage) {
        setProfileImg(`${VITE_BASE_URL}/uploads/profile/${response.data.profileImage}`);
      }
    } catch (error) {
      console.error("Error uploading profile image:", error);
    } finally {
      setUploading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
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
      const token = localStorage.getItem("token");
      await axios.put(
        `${VITE_BASE_URL}/teacher/change-password`,
        {
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      setPasswordSuccess("Password changed successfully");
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        reenterNewPassword: ""
      });
      setTimeout(() => {
        setShowChangePasswordForm(false);
        setPasswordSuccess("");
      }, 3000);
    } catch (error) {
      setPasswordError(
        error.response?.data?.message || "Failed to change password"
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <button
        onClick={handleBackToDashboard}
        className="flex items-center gap-2 text-blue-500 hover:underline mb-6"
      >
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">My Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Image */}
            <div className="col-span-1">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative w-40 h-40">
                  {profileImg ? (
                    <img
                      src={profileImg}
                      alt="Profile"
                      className="rounded-full w-full h-full object-cover border-4 border-gray-200"
                    />
                  ) : (
                    <div className="rounded-full w-full h-full bg-gray-200 flex items-center justify-center">
                      <User size={64} className="text-gray-400" />
                    </div>
                  )}
                  <label
                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-blue-700 transition-colors"
                    htmlFor="profileImage"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a3 3 0 0 0 2.12-.879l.83-.83A1 1 0 0 1 6.827 3h2.344a1 1 0 0 1 .707.293l.828.828A3 3 0 0 0 12.828 5H14a1 1 0 0 1 1 1v6zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4H2z"/>
                      <path d="M8 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zm0 1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                    </svg>
                  </label>
                  <input
                    type="file"
                    id="profileImage"
                    className="hidden"
                    onChange={handleAddImage}
                    accept="image/*"
                    disabled={uploading}
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-800">{userData?.name}</h3>
                  <p className="text-gray-600">{userData?.role}</p>
                </div>
                <button
                  onClick={() => setShowChangePasswordForm(!showChangePasswordForm)}
                  className="border border-blue-500 text-blue-500 hover:bg-blue-50 px-4 py-2 rounded transition-colors w-full"
                >
                  Change Password
                </button>
              </div>
            </div>

            {/* Profile Info */}
            <div className="col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoRow
                  icon={<Mail />}
                  label="Email"
                  value={userData?.email}
                />
                <InfoRow
                  icon={<Building />}
                  label="Department"
                  value={userData?.department}
                />
                <InfoRow
                  icon={<Phone />}
                  label="Contact"
                  value={userData?.contactNo || "Not provided"}
                />
                <InfoRow
                  icon={<User />}
                  label="Role"
                  value={userData?.role}
                />
                <InfoRow
                  icon={<Calendar />}
                  label="Joined On"
                  value={
                    userData?.createdAt
                      ? new Date(userData.createdAt).toLocaleDateString()
                      : "Not available"
                  }
                />
                 {/*<InfoRow
                  icon={<Hash />}
                  label="ID"
                  value={userData?._id}
                />*/}
              </div>

              {/* Change Password Form */}
              {showChangePasswordForm && (
                <div className="mt-8 bg-gray-50 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">
                    Change Password
                  </h4>
                  <form onSubmit={handleSubmitPasswordChange}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          name="oldPassword"
                          value={passwordData.oldPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          name="reenterNewPassword"
                          value={passwordData.reenterNewPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      {passwordError && (
                        <p className="text-red-600 text-sm">{passwordError}</p>
                      )}
                      {passwordSuccess && (
                        <p className="text-green-600 text-sm">{passwordSuccess}</p>
                      )}

                      <div className="flex gap-3 mt-4">
                        <button
                          type="submit"
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                        >
                          Update Password
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowChangePasswordForm(false)}
                          className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
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

export default AdvisorProfile;