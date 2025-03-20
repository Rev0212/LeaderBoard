import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const TeacherProtectWrapper = ({ children }) => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            navigate("/teacher-login");
            return;
        }

        // Check teacher role and redirect appropriately
        const checkRoleAndRedirect = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_BASE_URL}/teacher/profile`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    }
                );
                
                const role = response.data.role;
                
                // If HOD or Academic Advisor, redirect to their dashboard
                if (role === 'HOD' || role === 'Academic Advisor') {
                    navigate("/advisor-hod-dashboard");
                    return;
                }
                
                // Regular faculty can continue to teacher dashboard
                setLoading(false);
                
            } catch (error) {
                console.error("Error checking role:", error);
                // On error, redirect to login
                localStorage.removeItem("token");
                navigate("/teacher-login");
            }
        };

        checkRoleAndRedirect();
    }, [navigate, token]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return <>{children}</>;
};

export default TeacherProtectWrapper;