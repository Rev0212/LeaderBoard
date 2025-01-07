import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const TeacherProtectWrapper = ({ children }) => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            navigate("/teacher-login");
        }
    }, [navigate, token]); 

    
    if (!token) {
        return null;
    }

    return <>{children}</>;
};

export default TeacherProtectWrapper;