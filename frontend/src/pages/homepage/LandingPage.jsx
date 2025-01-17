import React from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from './SRM.jpg';
import srmLogo from './SRMlogo.png';

const LandingPage = () => {
    const navigate = useNavigate();

    const options = [
        {
            title: 'Student Login',
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
            <div className="absolute top-0 left-0 p-4">
                <img src={srmLogo} alt="SRM Logo" className="h-16" />
            </div>

            {/* Platform Name */}
            <h1 className="text-3xl font-bold text-white mb-10 bg-black bg-opacity-50 p-4 rounded-lg">
                Welcome to the SRM Institute of Science and Technology Leaderboard
            </h1>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
                {options.map((option, index) => (
                    <div
                        key={index}
                        className="relative w-full h-64 perspective"
                    >
                        <div
                            className="card bg-white shadow-md rounded-lg p-6 flex flex-col items-center text-center border shadow-lg"
                        >
                            <div className="card-inner">
                                <div className="card-front">
                                    <div className="text-5xl mb-4">{option.icon}</div>
                                    <h2 className="text-xl font-semibold text-gray-700 mb-2">{option.title}</h2>
                                    <p className="text-gray-600 mb-4">{option.description}</p>
                                </div>
                                <div className="card-back bg whitetext-gray-700 p-4 rounded-lg">
                                    <ul className="text-left text-gray-500 mb-4 space-y-2">
                                        {option.features.map((feature, i) => (
                                            <li key={i}>{feature}</li>
                                        ))}
                                    </ul>
                                    <button
                                        onClick={option.onClick}
                                        className={`px-4 py-2 text-white rounded-lg ${option.buttonColor} transition`}
                                    >
                                        {option.buttonLabel}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LandingPage;
