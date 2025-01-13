import React from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from './SRM.jpg'; // Adjust the path as per your folder structure
import srmLogo from './SRMlogo.png'; // Update the correct path // Add the correct path to your SRM logo image

const LandingPage = () => {
  const navigate = useNavigate();

  const options = [
    {
      title: 'Student Login',
      description: 'Login to upload your achievements and check your leaderboard rank.',
      buttonLabel: 'Explore Student Login',
      onClick: () => navigate('/student-login'),
      icon: '🧑‍🎓',
    },
    {
      title: 'Teacher Login',
      description: 'Login to manage student achievements and view progress.',
      buttonLabel: 'Explore Teacher Login',
      onClick: () => navigate('/teacher-login'),
      icon: '👩‍🏫',
    },
    {
      title: 'Admin Login',
      description: 'Admin portal for managing users and overall system data.',
      buttonLabel: 'Explore Admin Login',
      onClick: () => navigate('/admin-login'),
      icon: '⚙️',
    },
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center py-10"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute top-0 left-0 p-4">
        <img src={srmLogo} alt="SRM Logo" className="h-16" />
      </div>
      <h1 className="text-3xl font-bold text-white mb-10 bg-black bg-opacity-50 p-4 rounded-lg">
        Welcome to the SRM University Leaderboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {options.map((option, index) => (
          <div
            key={index}
            className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center text-center border hover:shadow-lg transition"
          >
            <div className="text-5xl mb-4">{option.icon}</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">{option.title}</h2>
            <p className="text-gray-600 mb-4">{option.description}</p>
            <button
              onClick={option.onClick}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              {option.buttonLabel}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LandingPage;
