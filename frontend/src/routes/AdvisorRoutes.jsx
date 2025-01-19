import { Navigate, Route, useNavigate } from 'react-router-dom';
import AdvisorDashboard from '../pages/AdvisorDashboard';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

export const AdvisorRoute = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const savedUser = localStorage.getItem('advisor-user');
    if (!savedUser) {
      navigate('/advisor/login');
    }
  }, [navigate]);

  if (!user && !localStorage.getItem('advisor-user')) {
    return <Navigate to="/advisor/login" />;
  }
  
  return children;
};

export const advisorRoutes = [
  {
    path: '/advisor/dashboard',
    element: (
      <AdvisorRoute>
        <AdvisorDashboard />
      </AdvisorRoute>
    )
  }
]; 