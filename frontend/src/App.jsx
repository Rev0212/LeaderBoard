import React from 'react';
import LandingPage from './pages/homepage/LandingPage'; // New Landing Page
import StudentLoginForm from './pages/Students/StudentLogin';
import StudentDashboard from './pages/Students/StudentDashboard';
import EventForm from './pages/Students/EventForm';
import StudentProtectWrapper from './Wrappers/StudentWrapper';
import TeacherLoginForm from './pages/Teachers/TeacherLogin';
import TeacherDashboard from './pages/Teachers/TeacherDashboard';
import TeacherProtectWrapper from './Wrappers/TeacherWrapper';
import EventHistoryTable from './components/EventList'
import AdminDashboard from './pages/Admin/AdminDashBoard';
import AdminLoginForm from './pages/Admin/AdminLogin'; // Admin Login Page
import ReportsPage from './pages/ReportsPage';
import { Route, Routes } from 'react-router-dom';


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
      <Route path="/student-login" element={<StudentLoginForm />} />
      <Route path='/event-submit' element={<StudentProtectWrapper><EventForm/></StudentProtectWrapper>}/>
      <Route path='/' element={<StudentProtectWrapper><StudentDashboard/></StudentProtectWrapper>}/>
    </Routes>
  );
};


export default App;
