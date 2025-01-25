import React from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from './SRM.jpg';
import srmLogo from './SRMlogo.png';

const LandingPage = () => {
    const navigate = useNavigate();

    const options = [
        {
            title: 'Student Login',
            description: 'Access your personal performance dashboard',
            features: [
                '🌟 View your current standing',
                '📅 Submit events to boost your rank',
                '🏆 Track your performance over time',
            ],
            buttonLabel: 'Enter as Student',
            onClick: () => navigate('/student-login'),
            hoverColor: 'hover:bg-blue-50',
            buttonColor: 'bg-blue-500 hover:bg-blue-600',
            icon: '🧑‍🎓',
        },
        {
            title: 'Teacher Login',
            description: 'Manage and monitor student activities',
            features: [
                '📊 View detailed reports',
                '📈 Monitor student performance over time',
                '🔎 Review submitted events and their impact',
            ],
            buttonLabel: 'Enter as Teacher',
            onClick: () => navigate('/teacher-login'),
            hoverColor: 'hover:bg-yellow-50',
            buttonColor: 'bg-yellow-500 hover:bg-yellow-600',
            icon: '👩‍🏫',
        },
        {
            title: 'Admin Login',
            description: 'Full platform administration access',
            features: [
                '⚙️ Administer the entire leaderboard platform',
                '📊 View analytics and reports',
                '🔧 Manage user access and event submissions',
            ],
            buttonLabel: 'Enter as Admin',
            onClick: () => navigate('/admin-login'),
            hoverColor: 'hover:bg-green-50',
            buttonColor: 'bg-green-500 hover:bg-green-600',
            icon: '⚙️',
        },
    ];

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center py-10 pb-20"
            style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            {/* SRM Logo */}
            <div className="absolute top-0 left-0 p-3 mb-6">
                <img src={srmLogo} alt="SRM Institute Logo" className="h-16" />
            </div>

            {/* Platform Name */}
            <h1 
                className="text-xl mt-12 font-bold text-white p-4 bg-black bg-opacity-50 text-center mb-6 m-3 rounded-lg" 
                aria-label="SRM Institute of Science and Technology Leaderboard"
            >
                Welcome to the SRM Institute of Science and Technology Leaderboard
            </h1>

            {/* Login Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
                {options.map((option, index) => (
                    <div 
                        key={index} 
                        className={`login-card bg-white bg-opacity-70 lg:bg-opacity-100 shadow-md rounded-lg p-4 m-3 flex flex-col ${option.hoverColor}`}
                    >
                        {/* Icon */}
                        <div className="text-5xl flex justify-center mb-2">
                            {option.icon}
                        </div>

                        {/* Title */}
                        <h2 className="text-xl font-semibold text-center mb-2">
                            {option.title}
                        </h2>

                        {/* Description */}
                        <p className="text-black text-center mb-4 text-lg">
                            {option.description}
                        </p>

                        {/* Features */}
                        <ul className="flex flex-col mb-4">
                            {option.features.map((feature, i) => (
                                <li key={i} className="text-black text-center">
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        {/* Button */}
                        <button 
                            onClick={option.onClick} 
                            className={`mt-auto text-white py-2 rounded hover:opacity-90 transition duration-200 ${option.buttonColor}`}
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