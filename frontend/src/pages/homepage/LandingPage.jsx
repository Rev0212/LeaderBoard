import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from './SRM.jpg';
import srmLogo from './SRMlogo.png';
import { FaTrophy, FaUserFriends, FaChartLine, FaGraduationCap, FaChalkboardTeacher, FaCogs } from 'react-icons/fa';

const LandingPage = () => {
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLoginClick = (role) => {
        navigate(`/${role}-login`); // Dynamic navigation
        setShowDropdown(false);
    };

    const roleInfo = [
        {
            role: 'Students',
            icon: <FaGraduationCap className="w-16 h-16 mb-6 text-blue-400 group-hover:text-yellow-400 transition-colors duration-300" />,
            description: 'Embark on your journey of excellence. Track achievements, participate in events, and rise through the ranks.',
            features: ['Event Participation', 'Achievement Tracking', 'Real-time Rankings', 'Performance Analytics']
        },
        {
            role: 'Teachers',
            icon: <FaChalkboardTeacher className="w-16 h-16 mb-6 text-blue-400 group-hover:text-yellow-400 transition-colors duration-300" />,
            description: 'Guide and inspire the next generation. Monitor progress, validate achievements, and foster growth.',
            features: ['Student Monitoring', 'Achievement Verification', 'Progress Tracking', 'Performance Reports']
        },
        {
            role: 'Admin',
            icon: <FaCogs className="w-16 h-16 mb-6 text-blue-400 group-hover:text-yellow-400 transition-colors duration-300" />,
            description: 'Streamline and manage the entire system. Organize events, manage users, and ensure smooth operations.',
            features: ['Event Management', 'User Administration', 'System Analytics', 'Platform Control']
        }
    ];

    return (
        <div className="min-h-screen relative flex flex-col w-full">
            {/* Background with overlay */}
            <div className="fixed inset-0 w-full h-full">
                <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${backgroundImage})` }}
                />
                {/* Full page overlay */}
                <div className="absolute inset-0 bg-black/60" /> {/* Adjusted opacity */}
            </div>

            {/* Main Content */}
            <div className="relative z-40 flex flex-col min-h-screen w-full">
                {/* Navbar with reduced height to 75px */}
                <nav className="h-[75px]"> 
                    <div className="w-full px-6">
                        <div className="flex justify-between items-center h-[75px]">
                            <div className="flex-shrink-0">
                                <img 
                                    src={srmLogo} 
                                    alt="SRM Logo" 
                                    className="h-16 w-auto mix-blend-screen brightness-100" // Reduced logo size
                                />
                            </div>
                            <div ref={dropdownRef}>
                                <button 
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-6 py-2 rounded-lg
                                    hover:from-yellow-600 hover:to-yellow-700 transition duration-300 font-semibold text-base
                                    shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    Login
                                </button>
                                {showDropdown && (
                                    <div className="absolute mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden">
                                        {['student', 'teacher', 'admin'].map((role) => (
                                            <button 
                                                key={role}
                                                onClick={() => handleLoginClick(role)}
                                                className="block w-full px-6 py-3 text-left capitalize hover:bg-gray-50 transition-colors
                                                text-gray-700 hover:text-black border-b border-gray-100 last:border-0"
                                            >
                                                {role}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <div className="flex-1 flex flex-col justify-center items-center text-center w-full pt-20">
                    <div className="w-full">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 whitespace-nowrap leading-normal">
                            PRO-RANK: POLICY BASED RANKING SYSTEM
                        </h1>
                        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                            LEARN, LEAP & LEAD
                        </p>
                    </div>
                </div>

                {/* Role Information Section - Darker background */}
                <div className="w-full py-20 relative">                  
                    <div className="relative z-10 w-full px-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {roleInfo.map((info) => (
                                <div 
                                    key={info.role}
                                    className="group border border-white/10 p-8 rounded-2xl
                                    hover:border-yellow-500/50 transition-all duration-300
                                    hover:shadow-2xl hover:shadow-yellow-500/10 transform hover:-translate-y-1
                                    bg-black/50" // Added subtle background to cards
                                >
                                    <div className="flex justify-center">
                                        {info.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-yellow-400 transition-colors">
                                        {info.role}
                                    </h3>
                                    <p className="text-gray-400 mb-6 leading-relaxed">
                                        {info.description}
                                    </p>
                                    <ul className="space-y-3">
                                        {info.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center text-gray-300">
                                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="w-full bg-black border-t border-white/10">
                    <div className="w-full px-6 py-6">
                        <div className="flex flex-col md:flex-row justify-between items-center">
                            <p className="text-gray-400">© 2025 SRM Leaderboard. All rights reserved.</p>
                            <div className="flex space-x-6 mt-4 md:mt-0">
                                <a href="https://www.srmist.edu.in" target="_blank" rel="noopener noreferrer" 
                                   className="text-gray-400 hover:text-yellow-400 transition-colors">
                                    About SRM
                                </a>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default LandingPage;