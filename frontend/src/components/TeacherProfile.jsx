import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Hash, Star, Calendar, ArrowLeft, Camera, Trash2, Building, GraduationCap, Users, Phone } from 'lucide-react';

const TeacherProfile = ({ teacherData, handleBackToDashboard }) => {
  const [loading, setLoading] = useState(!teacherData);
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

  useEffect(() => {
    if (teacherData) {
      setLoading(false);
      setProfileImg(teacherData.profileImg || null);
    }
  }, [teacherData]);

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
          console.log("Teacher registerNo:", teacherData?.registerNo, "Image URL:", imageUrl);

          setProfileImg(imageUrl);

          const baseUrl = import.meta.env.VITE_BASE_URL;
          
          await axios.put(
            `${baseUrl}/teacher/add`,
            {
              profileImg: imageUrl,
              registerNo: teacherData.registerNo
            },
            {
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("teacher-token") || localStorage.getItem("token")}`,
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
      const baseUrl = import.meta.env.VITE_BASE_URL;
      await axios.put(
        `${baseUrl}/teacher/add`,
        { 
          profileImg: null,
          registerNo: teacherData.registerNo 
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("teacher-token") || localStorage.getItem("token")}`,
          },
        }
      );
    } catch (error) {
      console.error("Failed to remove profile image on backend:", error);
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
      const baseUrl = import.meta.env.VITE_BASE_URL;
      await axios.put(
        `${baseUrl}/teacher/change-password`,
        {
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("teacher-token") || localStorage.getItem("token")}`,
          },
        }
      );
      setPasswordSuccess("Password changed successfully");
      setTimeout(() => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading teacher profile...</p>
        </div>
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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Profile Information</h2>
            <button
              onClick={() => setShowChangePasswordForm(!showChangePasswordForm)}
              className="border border-blue-500 text-blue-500 hover:bg-blue-50 px-4 py-2 rounded transition-colors"
            >
              Change Password
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Image and Name Section */}
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
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800">{teacherData?.name}</h3>
                <p className="text-gray-600">{teacherData?.email}</p>
              </div>
            </div>

            {/* Profile Info */}
            <div className="col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoRow icon={<Mail />} label="Email Address" value={teacherData?.email} />
                <InfoRow icon={<Building />} label="Department" value={teacherData?.department} />
                <InfoRow icon={<Hash />} label="Register Number" value={teacherData?.registerNo} />
                <InfoRow icon={<GraduationCap />} label="Role" value={teacherData?.role} />
                <InfoRow 
                  icon={<Users />} 
                  label="Classes Assigned" 
                  value={
                    teacherData?.classes?.length > 0 
                      ? teacherData.classes.map(classItem => classItem.className).join(', ') 
                      : "No Classes Assigned"
                  } 
                />
                <InfoRow 
                  icon={<Calendar />} 
                  label="Joined" 
                  value={teacherData?.createdAt ? new Date(teacherData.createdAt).toLocaleDateString() : "N/A"} 
                />
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

export default TeacherProfile;