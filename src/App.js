import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Tasks from './components/Tasks';
import Login from './components/Login';
import AttendancePage from './components/AttendancePage';
import Reports from './components/Reports';
import InternPage from './components/InternPage';
// import InternTasksPage from './components/InternTasksPage';
import InternTasksPage from './components/InternsTasks';

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
              </nav>

              {/* Main content for admin */}
              {currentPage === 'attendance' && <AttendancePage />}
              {currentPage === 'tasks' && <Tasks />}
              {currentPage === 'reports' && <Reports />}
            </>
          ) : (
            // If the role is not admin, show InternPage with routing
            <>
              <nav style={styles.nav}>
                <Link to="/intern" style={styles.link}>
                    Attendance
                </Link>
                <Link to="/intern/tasks" style={styles.link}>
                    My Tasks
                </Link>
                <button onClick={handleLogout} style={styles.logoutButton}>
                    Logout
                </button>
              </nav>

              {/* Intern routes */}
              <Routes>
                <Route path="/intern" element={<InternPage />} />
                <Route path="/intern/tasks" element={<InternTasksPage />} />
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
    justifyContent: 'center',
    gap: '15px',
    padding: '10px',
    backgroundColor: '#f1f1f1',
  },
  button: {
    padding: '8px 16px',
    cursor: 'pointer',
    backgroundColor: '#1976d2',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    margin: '10px'
  },
  link: {
    padding: '8px 16px',
    backgroundColor: '#d32f2f',
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
    backgroundColor: '#d32f2f',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    margin: '10px',
    cursor: 'pointer',
  },
};

export default App;