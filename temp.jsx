import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { User, Mail, Hash, Star, Calendar, Camera, ArrowLeft, Trash2 } from "lucide-react";

const MobileStudentProfile = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudentData = useCallback(async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/student/profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("student-token")}`,
          "Content-Type": "application/json",
        },
      });
      setStudent(response.data);
      setProfileImg(response.data.profileImg || null);
    } catch (err) {
      console.error("Error fetching student data:", err);
      setError("Failed to load student data.");
      navigate("/student-login");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

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
            registerNo: student.registerNo
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      } catch (error) {
        console.error("Image upload failed:", error);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleRemoveImage = async () => {
    setProfileImg(null);
    try {
      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/student/remove-profile-image`,
        { registerNo: student.registerNo },
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

  const InfoCard = React.memo(({ icon, label, value }) => (
    <div className="flex items-center gap-4 p-4 bg-gray-100 rounded-lg shadow-sm">
      <div className="bg-blue-50 p-4 rounded-full text-blue-500">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-lg font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  ));

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => navigate("/student-dashboard")} className="text-blue-500">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Profile</h1>
        <div>{/* Placeholder for potential additional actions */}</div>
      </div>

      <div className="flex flex-col items-center mb-8">
        {profileImg ? (
          <div className="relative">
            <img
              src={profileImg}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 mb-4"
            />
            <button 
              onClick={handleRemoveImage} 
              className="absolute bottom-2 right-0 bg-red-500 text-white rounded-full p-1"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ) : (
          <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-4">
            <Camera size={32} className="text-gray-500" />
          </div>
        )}
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleAddImage}
          className="hidden" 
          id="mobile-profile-image-upload" 
        />
        <label 
          htmlFor="mobile-profile-image-upload" 
          className="text-blue-500 cursor-pointer hover:underline"
        >
          {profileImg ? "Change Image" : "Upload Image"}
        </label>
        <h2 className="text-xl font-bold mt-2">{student?.name || "N/A"}</h2>
        <p className="text-gray-600">{student?.email || "N/A"}</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <InfoCard icon={<User />} label="Register Number" value={student?.registerNo || "N/A"} />
        <InfoCard 
          icon={<Calendar />} 
          label="Events Participated" 
          value={student?.eventsParticipated?.filter(event => event.status === 'Approved')?.length || 0} 
        />
        <InfoCard icon={<Star />} label="Total Points" value={student?.totalPoints || 0} />
        <InfoCard icon={<Hash />} label="Class" value={student?.class?.className || "N/A"} />
      </div>
    </div>
  );
};

export default MobileStudentProfile;