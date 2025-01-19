import React from 'react';
import LandingPage from './pages/homepage/LandingPage'; // New Landing Page
import StudentLoginForm from './pages/Students/StudentLogin';
import StudentDashboard from './pages/Students/StudentDashboard';
import EventForm from './pages/Students/EventForm';
import StudentProtectWrapper from './Wrappers/StudentWrapper';
import TeacherLoginForm from './pages/Teachers/TeacherLogin';
import HomePage from './pages/HomePage';
import TeacherDashboard from './pages/Teachers/TeacherDashboard';
import TeacherProtectWrapper from './Wrappers/TeacherWrapper';
import EventHistoryTable from './components/EventList'
import AdminDashboard from './pages/Admin/AdminDashBoard';
import AdminLoginForm from './pages/Admin/AdminLogin'; // Admin Login Page
import ReportsPage from './pages/ReportsPage';
import EventTable from './pages/Teachers/TeacherEventVerify';
import { Route, Routes, Link, BrowserRouter } from 'react-router-dom';
import UpcomingEvents from './pages/UpcomingEvents';
import AdvisorLogin from './pages/AdvisorLogin';
import AdvisorDashboard from './pages/AdvisorDashboard';
import { advisorRoutes, AdvisorRoute } from './routes/AdvisorRoutes';
import { AuthProvider } from './context/AuthContext';


const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} /> 
          <Route path="/admin-login" element={<AdminLoginForm />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path='/reports' element={<ReportsPage/>}/>
          <Route path='/events' element={<EventHistoryTable/>}/>
          <Route path='/admin-dashboard' element={<AdminDashboard/>}/>
          <Route path="/teacher-login" element={<TeacherLoginForm/>}/>
          <Route path="/teacher-dashboard" element={<TeacherProtectWrapper><TeacherDashboard/></TeacherProtectWrapper>}/>
          <Route path="/student-login" element={<StudentLoginForm />} />
          <Route path='/event-submit' element={<StudentProtectWrapper><EventForm/></StudentProtectWrapper>}/>
          <Route path='/student-dashboard' element={<StudentProtectWrapper><StudentDashboard/></StudentProtectWrapper>}/>
          <Route path='/teacher-events' element={<TeacherProtectWrapper><EventTable/></TeacherProtectWrapper>}/>
          <Route path="/" element={<HomePage/>}/>
          <Route path="/upcoming-events" element={<UpcomingEvents />} />
          <Route path="/advisor/login" element={<AdvisorLogin />} />
          <Route path="/advisor/dashboard" element={
            <AdvisorRoute>
              <AdvisorDashboard />
            </AdvisorRoute>
          } />
          {advisorRoutes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};


export default App;
