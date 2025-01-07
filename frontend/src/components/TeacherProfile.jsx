import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Hash, Star, Calendar, ArrowLeft, Camera, Trash2 } from 'lucide-react';

const TeacherProfile = ({ teacherData, handleBackToDashboard }) => {
  const [profileImg, setProfileImg] = useState(teacherData?.profileImg || null);
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
    setProfileImg(teacherData?.profileImg || null);
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
            method: "PUT",
            body: formData,
          }
        );

        const responseData = await cloudinaryResponse.json();
        console.log("Image upload response:", responseData);
        const imageUrl = responseData.url;

        setProfileImg(imageUrl);

        await axios.put(
          `${import.meta.env.VITE_BASE_URL}/teacher/add-profile-img`,
          {
            profileImg: imageUrl,
            registerNo: teacherData.registerNo
          },
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("teacher-token")}`,
            },
          }
        );
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
        `/api/teachers/${teacherData._id}/profile-image`,
        { profileImg: null },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("teacher-token")}`,
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
      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/teacher/change-password`,
        {
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("teacher-token")}`,
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-10 px-6">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleBackToDashboard}
            className="flex items-center gap-2 text-blue-500 hover:underline"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
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
              <h1 className="text-2xl font-bold text-gray-800">{teacherData?.name || "N/A"}</h1>
              <p className="text-gray-600">{teacherData?.email || "N/A"}</p>
            </div>
          </div>

          <div className="space-y-6">
            <InfoRow icon={<User />} label="Full Name" value={teacherData?.name} />
            <InfoRow icon={<Mail />} label="Email Address" value={teacherData?.email} />
            <InfoRow icon={<Hash />} label="Register Number" value={teacherData?.registerNo} />
            <InfoRow 
              icon={<Calendar />} 
              label="Class Incharge" 
              value={teacherData?.classes?.[0]?.className || "N/A"} 
            />
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Teacher ID: <span className="font-mono">{teacherData?._id}</span>
            </p>
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
                  <label className="block text-gray-700 mb-2 font-medium">Old Password</label>
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
                  <label className="block text-gray-700 mb-2 font-medium">Re-enter New Password</label>
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
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center space-x-4">
    <div className="bg-gray-100 p-3 rounded-full">
      {React.cloneElement(icon, { className: "h-6 w-6 text-gray-600" })}
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  </div>
);

export default TeacherProfile;