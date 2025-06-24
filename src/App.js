import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';

import Tasks from './components/Tasks';
import Login from './components/Login';
import AttendancePage from './components/AttendancePage';
import Reports from './components/Reports';
import InternPage from './components/InternPage';
import InternTasksPage from './components/InternsTasks';
import MentorDashboard from './components/MentorDashboard';
import MentorTasks from './components/MentorTasks';
import MentorCharts from './components/MentorCharts';
import UpdatePassword from './components/UpdatePass';

import logo from './components/logo.webp';
import './App.css';
import './media.css';

const AppContent = ({ isLoggedIn, role, handleLogin, handleLogout }) => {
  const location = useLocation();

  if (!isLoggedIn) {
    // Redirect to /login if not logged in and trying to access a protected page
    if (location.pathname !== '/login' && location.pathname !== '/register') {
      return <Navigate to="/login" />;
    }

    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        {/* You can add a Register component here if needed */}
        {/* <Route path="/register" element={<Register onRegister={handleRegister} />} /> */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  if (role === 'admin') {
    return (
      <>
        <nav className="navbar">
          <img src={logo} alt="Logo" className="logos" />
          <div className='nav-links'>
            <Link to="/admin/attendance" className="link">Attendance</Link>
            <Link to="/admin/tasks" className="link">Tasks</Link>
            <Link to="/admin/reports" className="link">Reports</Link>
            <button onClick={handleLogout} className="link">Logout</button>
          </div>
        </nav>
        <Routes>
          <Route path="/admin/attendance" element={<AttendancePage />} />
          <Route path="/admin/tasks" element={<Tasks />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="*" element={<Navigate to="/admin/attendance" />} />
        </Routes>
      </>
    );
  }

  if (role === 'mentor') {
    return (
      <>
        <nav className="navbar">
          <img src={logo} alt="Logo" className="logos" />
          <div className="nav-links">
            <Link to="/mentor/dashboard" className="link">Dashboard</Link>
            <Link to="/mentor/tasks" className="link">Tasks</Link>
            <Link to="/mentor/charts" className="link">Charts</Link>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>
        </nav>
        <Routes>
          <Route path="/mentor/dashboard" element={<MentorDashboard />} />
          <Route path="/mentor/tasks" element={<MentorTasks />} />
          <Route path="/mentor/charts" element={<MentorCharts />} />
          <Route path="*" element={<Navigate to="/mentor/dashboard" />} />
        </Routes>
      </>
    );
  }

  return (
    <>
      <nav className="navbar">
        <img src={logo} alt="Logo" className="logos" />
        <div className="nav-links">
          <Link to="/intern" className="link">Attendance</Link>
          <Link to="/intern/tasks" className="link">My Tasks</Link>
          <Link to="/update-password" className="link">Profile</Link>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </nav>
      <Routes>
        <Route path="/intern" element={<InternPage />} />
        <Route path="/intern/tasks" element={<InternTasksPage />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="*" element={<Navigate to="/intern" />} />
      </Routes>
    </>
  );
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const auth = localStorage.getItem('isLoggedIn');
    setIsLoggedIn(auth === 'true');
    setRole(localStorage.getItem('role'));
  }, []);

  const handleLogin = (role) => {
    setIsLoggedIn(true);
    setRole(role);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('role', role);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setRole(null);
  };

  return (
    <Router>
      <AppContent
        isLoggedIn={isLoggedIn}
        role={role}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
      />
    </Router>
  );
};

export default App;
