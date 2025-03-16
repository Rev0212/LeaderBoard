import React from 'react';
import LandingPage from './pages/homepage/LandingPage';
import StudentLoginForm from './pages/Students/StudentLogin';
import StudentDashboard from './pages/Students/StudentDashboard';
import EventForm from './pages/Students/EventForm';
import StudentProtectWrapper from './Wrappers/StudentWrapper';
import TeacherLoginForm from './pages/Teachers/TeacherLogin';
import HomePage from './pages/HomePage';
import TeacherDashboard from './pages/Teachers/TeacherDashboard';
import TeacherProtectWrapper from './Wrappers/TeacherWrapper';
import AdvisorHodWrapper from './Wrappers/AdvisorHodWrapper';
import EventHistoryTable from './components/EventList'
import AdminDashboard from './pages/Admin/AdminDashBoard';
import AdminLoginForm from './pages/Admin/AdminLogin';
import ReportsPage from './pages/ReportsPage';
import EventTable from './pages/Teachers/TeacherEventVerify';
import EventsList from './components/EventsList'
import AdvisorHodDashboard from './pages/AdvisorHod/AdvisorHodDashboard';
import ClassDetailsView from './pages/AdvisorHod/ClassDetailsView';
import { Route, Routes, Link } from 'react-router-dom';
import UpcomingEvents from './pages/UpcomingEvents';
import StudentProfile from './pages/Students/StudentProfile';
import StudentEventHistory from './components/StudentEventHistory';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} /> 
      <Route path="/admin-login" element={<AdminLoginForm />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path='/reports' element={<ReportsPage/>}/>
      <Route path='/events' element={<EventHistoryTable/>}/>
      <Route path='/admin-dashboard' element={<AdminDashboard/>}/>
      <Route path="/teacher-login" element={<TeacherLoginForm/>}/>
      <Route path="/teacher-dashboard" element={<TeacherProtectWrapper><TeacherDashboard/></TeacherProtectWrapper>}/>
      <Route path="/advisor-hod-dashboard" element={<AdvisorHodWrapper><AdvisorHodDashboard/></AdvisorHodWrapper>}/>
      <Route path="/advisor-hod/class/:classId" element={<AdvisorHodWrapper><ClassDetailsView/></AdvisorHodWrapper>}/>
      <Route path="/student-login" element={<StudentLoginForm />} />
      <Route path="/student-profile" element={<StudentProfile/>}/>
      <Route path='/event-submit' element={<StudentProtectWrapper><EventForm/></StudentProtectWrapper>}/>
      <Route path='/student-dashboard' element={<StudentDashboard/>}/>
      <Route path='/teacher-events' element={<TeacherProtectWrapper><EventTable/></TeacherProtectWrapper>}/>
      <Route path="/" element={<HomePage/>}/>
      <Route path="/upcoming-events" element={<UpcomingEvents />} />
      <Route path='/student-events' element={<StudentProtectWrapper><StudentEventHistory handleBackToDashboard={() => window.history.back()} /></StudentProtectWrapper>}/>
    </Routes>
  );
};

export default App;
