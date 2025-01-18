import React, { useState, useEffect } from "react";
import axios from "axios";
import { User, Mail, Hash, Star, Calendar, Camera, Trash2, ArrowLeft } from "lucide-react";

const StudentProfile = ({ studentData, handleBackToDashboard }) => {
  const [profileImg, setProfileImg] = useState(studentData?.profileImg || null);
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
    setProfileImg(studentData?.profileImg || null);
  }, [studentData]);

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
        const imageUrl = responseData.url;

        setProfileImg(imageUrl);

        await axios.put(
          `${import.meta.env.VITE_BASE_URL}/student/add-profile-img`,
          {
            profileImg: imageUrl,
            registerNo: studentData.registerNo
          },
          {
            headers: {
              "Content-Type": "application/json",
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
        `/api/students/${studentData._id}/profile-image`,
        { profileImg: null },
        {
          headers: {
            "Content-Type": "application/json",
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
        `${import.meta.env.VITE_BASE_URL}/student/change-password`,
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-10 px-6">
      <div className="w-full max-w-6xl bg-white rounded-lg shadow-lg p-10 flex flex-col gap-8 relative">
        <div className="w-full flex justify-between mb-6">
          <button
            onClick={handleBackToDashboard}
            className="flex items-center gap-2 text-blue-500 hover:underline"
          >
            <ArrowLeft size={20} /> Back to Dashboard
          </button>
          <button
            onClick={() => setShowChangePasswordForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Change Password
          </button>
        </div>

        <div className={showChangePasswordForm ? 'opacity-50' : 'opacity-100'}>
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {profileImg ? (
                <div className="relative">
                  <img
                    src={profileImg}
                    alt="Profile"
                    className="w-40 h-40 rounded-full object-cover border-4 border-blue-500"
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
                  <div className="w-40 h-40 bg-gray-200 rounded-full flex items-center justify-center border-2 border-dashed border-gray-400">
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

            <h1 className="text-2xl font-bold text-gray-800">
              {studentData?.name || "N/A"}
            </h1>
            <p className="text-gray-600 text-lg">{studentData?.email || "N/A"}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            <InfoCard icon={<User />} label="Register Number" value={studentData?.registerNo || "N/A"} />
            <InfoCard icon={<Calendar />} label="Events Participated" value={studentData?.eventsParticipated?.length || 0} />
            <InfoCard icon={<Star />} label="Total Points" value={studentData?.totalPoints || 0} />
            <InfoCard icon={<Hash />} label="Class" value={studentData?.class?.className || "N/A"} />
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

const InfoCard = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 p-4 bg-gray-100 rounded-lg shadow-sm">
    <div className="bg-blue-100 p-4 rounded-full text-blue-500">{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-gray-800">{value}</p>
    </div>
  </div>
);

export default StudentProfile;