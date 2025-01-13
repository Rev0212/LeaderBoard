import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const StudentProtectWrapper = ({ children }) => {
    const navigate = useNavigate();
    const token = localStorage.getItem("student-token");

    useEffect(() => {
        if (!token) {
            navigate("/student-login");
        } else {
            navigate("/student-dashboard");  
        }
    }, [navigate, token]); 

    if (!token) {
        return null;
    }

    return <>{children}</>;
};

export default StudentProtectWrapper;
