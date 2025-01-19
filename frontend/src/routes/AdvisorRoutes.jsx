import { Navigate, Route } from 'react-router-dom';
import AdvisorDashboard from '../pages/AdvisorDashboard';
import { useAuth } from '../context/AuthContext';

export const AdvisorRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user || (user.role !== 'advisor' && user.role !== 'hod')) {
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