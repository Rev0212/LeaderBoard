import React from 'react';
import { Navigate } from 'react-router-dom';

const StudentProtectWrapper = ({ children }) => {
  const token = localStorage.getItem("student-token");
  
  if (!token) {
    return <Navigate to="/student-login" replace />;
  }
  
  return children;
};

export default StudentProtectWrapper;
