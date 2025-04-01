import React, { useState, useEffect } from "react";
import { ArrowLeft, Mail, Building, Phone, User, Calendar, Hash, Camera, Trash2 } from "lucide-react";
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
    if (userData) {
      setLoading(false);
      
      // Fix the image path handling here
      if (userData.profileImg) {
        // Check if the profileImg already includes the base URL
        if (userData.profileImg.startsWith('http')) {
          setProfileImg(userData.profileImg);
        } else {
          // Otherwise, prepend the base URL
          setProfileImg(`${VITE_BASE_URL}${userData.profileImg}`);
        }
      } else {
        setProfileImg(null);
      }
    }
  }, [userData, VITE_BASE_URL]);

  const handleAddImage = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setUploading(true);
    
    try {
      // Create FormData with the file
      const formData = new FormData();
      formData.append("profileImage", file);
      
      const token = localStorage.getItem("teacher-token") || localStorage.getItem("token");
      
      // Upload profile image to backend
      const uploadResponse = await axios.post(
        `${VITE_BASE_URL}/teacher/upload-profile-image`, 
        formData, 
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );
      
      // Update profile image path in teacher data
      await axios.put(
        `${VITE_BASE_URL}/teacher/update-profile-image`,
        { profileImg: uploadResponse.data.filePath },
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      // Update UI with new image
      const imageUrl = `${VITE_BASE_URL}${uploadResponse.data.filePath}`;
      setProfileImg(imageUrl);
      
    } catch (error) {
      console.error("Image upload failed:", error);
      setPasswordError("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    try {
      const token = localStorage.getItem("teacher-token") || localStorage.getItem("token");
      
      await axios.put(
        `${VITE_BASE_URL}/teacher/update-profile-image`,
        { profileImg: null },
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      setProfileImg(null);
      
    } catch (error) {
      console.error("Failed to remove profile image:", error);
      setPasswordError("Failed to remove profile image. Please try again.");
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
      {/* <button
        onClick={handleBackToDashboard}
        className="flex items-center gap-2 text-blue-500 hover:underline mb-6"
      >
        <ArrowLeft size={20} />
        Back to Dashboard
      </button> */}

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Profile Information</h2>
            <button
              onClick={() => setShowChangePasswordForm(!showChangePasswordForm)}
              className="border border-blue-500 text-blue-500 hover:bg-blue-50 px-4 py-2 rounded transition-colors"
            >
              Change Password
            </button>
          </div>
          
          {/* Profile Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Image Section */}
            <div className="col-span-1 flex flex-col items-center space-y-4">
              <div className="relative">
                {profileImg ? (
                  <img
                    src={profileImg}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
                    <User size={64} className="text-gray-400" />
                  </div>
                )}
                <label
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-blue-700 transition-colors"
                  htmlFor="profileImage"
                >
                  <Camera size={16} />
                </label>
                <input
                  type="file"
                  id="profileImage"
                  className="hidden"
                  onChange={handleAddImage}
                  accept="image/*"
                  disabled={uploading}
                />
                {profileImg && (
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-0 right-0 bg-red-600 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800">{userData?.name}</h3>
                <p className="text-gray-600">{userData?.email}</p>
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
                  icon={<User />}
                  label="Role"
                  value={userData?.role}
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