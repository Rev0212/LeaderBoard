import React, { useState, useEffect } from "react";
import axios from "axios";
import { User, Mail, Hash, Star, Calendar, Camera, Trash2, ArrowLeft } from "lucide-react";

const StudentProfile = ({ studentData, handleBackToDashboard }) => {
  console.log("Student Data:", studentData);
  const [profileImg, setProfileImg] = useState(studentData?.profileImg || null);
  const [uploading, setUploading] = useState(false);

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

        // Send the updated image URL to the backend
        await axios.put(
          `${import.meta.env.VITE_BASE_URL}/student/add-profile-img`,
          { profileImg: imageUrl ,
            registerNo: studentData.registerNo
           },
          {
            headers: {
              "Content-Type": "application/json",
            },
        }
        );

        console.log("Image URL updated on backend:", imageUrl);
      } catch (error) {
        console.error("Image upload failed:", error);
        alert("Failed to upload image. Please try again.");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleRemoveImage = async () => {
    setProfileImg(null);

    try {
      // Update backend to remove the profile image
      await axios.put(
        `/api/students/${studentData._id}/profile-image`,
        { profileImg: null },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Profile image removed on backend.");
    } catch (error) {
      console.error("Failed to remove profile image on backend:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-10 px-6">
      <div className="w-full max-w-6xl bg-white rounded-lg shadow-lg p-10 flex flex-col gap-8">
        {/* Back to Dashboard */}
        <div className="w-full flex justify-start mb-6">
          <button
            onClick={handleBackToDashboard}
            className="flex items-center gap-2 text-blue-500 hover:underline"
          >
            <ArrowLeft size={20} /> Back to Dashboard
          </button>
        </div>

        <div className="flex flex-col items-center gap-4">
          {/* Profile Image */}
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

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <InfoCard icon={<User />} label="Register Number" value={studentData?.registerNo || "N/A"} />
          <InfoCard icon={<Calendar />} label="Events Participated" value={studentData?.eventsParticipated?.length || 0} />
          <InfoCard icon={<Star />} label="Total Points" value={studentData?.totalPoints || 0} />
          <InfoCard icon={<Hash />} label="Class ID" value={studentData?.class || "N/A"} />
          <InfoCard icon={<Hash />} label="Student ID" value={studentData?._id || "N/A"} />
        </div>
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
