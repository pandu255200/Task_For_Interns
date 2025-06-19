import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Tasks from './components/Tasks';
import Login from './components/Login';
import AttendancePage from './components/AttendancePage';
import Reports from './components/Reports';
import InternPage from './components/InternPage';
// import InternTasksPage from './components/InternTasksPage';
import InternTasksPage from './components/InternsTasks';
import logo from './components/logo.webp'
import './App.css'
import UpdatePassword from './components/UpdatePass';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);
  const [currentPage, setCurrentPage] = useState('attendance');

  useEffect(() => {
    const auth = localStorage.getItem('isLoggedIn');
    setIsLoggedIn(auth === 'true');
    setRole(localStorage.getItem('role'));
  }, []);

  const handleLogin = (role) => {
    setIsLoggedIn(true);
    setRole(role);
    localStorage.setItem('isLoggedIn', 'true'); // persist login
    localStorage.setItem('role', role);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    localStorage.removeItem('name');
    setIsLoggedIn(false);
    setRole(null);
  };

  return (
    <Router>
      <div>
        {isLoggedIn ? (
          role === 'admin' ? (
            <>
              {/* Navbar for admin */}
             <nav style={styles.nav}>
  {/* Logo to the left */}
  <img src={logo} alt="Logo" style={styles.logo} />

  {/* Buttons centered */}
  <div style={styles.navButtons}>
    <button onClick={() => setCurrentPage('attendance')} style={styles.button}>
      Attendance
    </button>
    <button onClick={() => setCurrentPage('tasks')} style={styles.button}>
      Tasks
    </button>
    <button onClick={() => setCurrentPage('reports')} style={styles.button}>
      Reports
    </button>
    <button onClick={handleLogout} style={styles.logoutButton}>
      Logout
    </button>
  </div>
</nav>


              {/* Main content for admin */}
              {currentPage === 'attendance' && <AttendancePage />}
              {currentPage === 'tasks' && <Tasks />}
              {currentPage === 'reports' && <Reports />}
            </>
          ) : (
            // If the role is not admin, show InternPage with routing
            <>
<nav className="navbar">
  {/* Logo to the left */}
  <img src={logo} alt="Logo" className="logos" />

  {/* Links centered */}
  <div className="nav-links">
    <Link to="/intern" className="link">
      Attendance
    </Link>
    <Link to="/intern/tasks" className="link">
      My Tasks
    </Link>
    <Link to="/update-password" className="link">
      Profile
    </Link>
    <button onClick={handleLogout} className="logout-button">
      Logout
    </button>
  </div>
</nav>


              {/* Intern routes */}
              <Routes>
                <Route path="/intern" element={<InternPage />} />
                  <Route path="/intern/tasks" element={<InternTasksPage />} />
                   <Route path="/update-password" element={<UpdatePassword />} />
              </Routes>
            </>
          )
        ) : (
          <Login onLogin={(role) => handleLogin(role)} />
        )}

      </div>
    </Router>
  );
};

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
    backgroundColor: '#f1f1f1',
  },
  logo: {
    width: '130px',
    height: '45px',
    marginRight: 'auto', // Push everything else toward the center
  },
  navButtons: {
    display: 'flex',
    gap: '15px',
    margin: '0 auto',
    alignItems: 'center',
     marginLeft: '2%',
  },
  button: {
    padding: '8px 16px',
    cursor: 'pointer',
    backgroundColor: '#f44336',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    margin: '10px'
  },
  link: {
    padding: '8px 16px',
    backgroundColor: '#f44336',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    textDecoration: 'none',
    margin: '10px',
    display: 'inline-block',
    cursor: 'pointer',
  },
  logoutButton: {
    padding: '8px 16px',
    backgroundColor: '#f44336',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    margin: '10px',
    cursor: 'pointer',
  },
  
};



export default App;
