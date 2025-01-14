import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const navigate = useNavigate();

    const navigateTo = (path) => {
        navigate(path);
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            {/* Platform Name */}
            <h1 className="text-5xl font-extrabold text-black mb-12">Leaderboard Platform</h1>

            <div className="flex flex-row items-center justify-center w-full space-x-6">
                {/* Student Card */}
                <div 
                    onClick={() => navigateTo('/student-login')} 
                    className="flex-1 max-w-sm p-6 bg-white rounded-3xl shadow-lg text-center cursor-pointer transform transition duration-300 ease-in-out hover:scale-105 hover:bg-blue-50 hover:shadow-2xl"
                >
                    <h2 className="text-3xl font-extrabold text-gray-800 mb-4">Student</h2>
                    <p className="text-lg text-gray-600 mb-4">Check your rank on the leaderboard and stay ahead!</p>
                    <ul className="text-left text-gray-500 space-y-2">
                        <li>🌟 View your current standing</li>
                        <li>📅 Submit events to boost your rank</li>
                        <li>🏆 Track your performance over time</li>
                    </ul>
                    <div className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-full font-semibold text-lg transition duration-300 ease-in-out hover:bg-blue-600">
                        Enter as Student
                    </div>
                </div>

                {/* Teacher Card */}
                <div 
                    onClick={() => navigateTo('/teacher-login')} 
                    className="flex-1 max-w-sm p-6 bg-white rounded-3xl shadow-lg text-center cursor-pointer transform transition duration-300 ease-in-out hover:scale-105 hover:bg-yellow-50 hover:shadow-2xl"
                >
                    <h2 className="text-3xl font-extrabold text-gray-800 mb-4">Teacher</h2>
                    <p className="text-lg text-gray-600 mb-4">Review student submissions and track their progress!</p>
                    <ul className="text-left text-gray-500 space-y-2">
                        <li>📊 View detailed reports</li>
                        <li>📈 Monitor student performance over time</li>
                        <li>🔎 Review submitted events and their impact</li>
                    </ul>
                    <div className="mt-6 px-6 py-3 bg-yellow-500 text-white rounded-full font-semibold text-lg transition duration-300 ease-in-out hover:bg-yellow-600">
                        Enter as Teacher
                    </div>
                </div>

                {/* Admin Card */}
                <div 
                    onClick={() => navigateTo('/admin-login')} 
                    className="flex-1 max-w-sm p-6 bg-white rounded-3xl shadow-lg text-center cursor-pointer transform transition duration-300 ease-in-out hover:scale-105 hover:bg-green-50 hover:shadow-2xl"
                >
                    <h2 className="text-3xl font-extrabold text-gray-800 mb-4">Admin</h2>
                    <p className="text-lg text-gray-600 mb-4">Manage the platform and oversee event submissions!</p>
                    <ul className="text-left text-gray-500 space-y-2">
                        <li>⚙️ Administer the entire leaderboard platform</li>
                        <li>📊 View analytics and reports</li>
                        <li>🔧 Manage user access and event submissions</li>
                    </ul>
                    <div className="mt-6 px-6 py-3 bg-green-500 text-white rounded-full font-semibold text-lg transition duration-300 ease-in-out hover:bg-green-600">
                        Enter as Admin
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
