import React from 'react';
import StudentRegistrationForm from './pages/Students/StudentRegister';
import StudentLoginForm from './pages/Students/StudentLogin';
import StudentDashboard from './pages/Students/StudentDashboard';
import EventForm from './pages/Students/EventForm';
import StudentProtectWrapper from './pages/Students/StudentWrapper';
import StudentProfile from './pages/Students/StudentProfile';
import TeacherRegistrationForm from './pages/Teachers/RegisterTeacher';
import TeacherLoginForm from './pages/Teachers/TeacherLogin';
import TeacherDashboard from './pages/Teachers/TeacherDashboard';
import EventHistoryTable from './components/EventList'
import AdminDashboard from './pages/Admin/AdminDashBoard';
import { Route, Routes } from 'react-router-dom';


const App = () => {
  return (
    <Routes>
      <Route path='/events' element={<EventHistoryTable/>}/>
      <Route path='/admin-dashboard' element={<AdminDashboard/>}/>
      <Route path="/teacher-login" element={<TeacherLoginForm/>}/>
      <Route path="/teacher-register" element={<TeacherRegistrationForm />} />
      <Route path="/teacher-dashboard" element={<TeacherDashboard/>}/>
      <Route path="/student-login" element={<StudentLoginForm />} />
      <Route path="/student-register" element={<StudentRegistrationForm />} />
      <Route path='/event-submit' element={<StudentProtectWrapper><EventForm/></StudentProtectWrapper>}/>
      <Route path='/' element={<StudentProtectWrapper><StudentDashboard/></StudentProtectWrapper>}/>
      <Route path='/student-profile' element = {<StudentProtectWrapper><StudentProfile/></StudentProtectWrapper>}/>
    </Routes>
  );
};


export default App;
