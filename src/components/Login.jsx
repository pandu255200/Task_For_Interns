import React, { useState, useEffect } from 'react';
import './styles/Login.css';
import logo from './logo.webp';
import { Select, SelectItem } from "@nextui-org/react";

const Login = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('intern');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mentorId, setMentorId] = useState('');
  const [mentors, setMentors] = useState([]);

  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  // 🔄 Fetch mentors when registration mode is active
  useEffect(() => {
    const fetchMentors = async () => {
      if (isRegistering && role === 'intern') {
        try {
          const res = await fetch(`${API_BASE}/api/mentors`);
          const data = await res.json();
          setMentors(data);
        } catch (err) {
          console.error('Failed to fetch mentors', err);
        }
      }
    };

    fetchMentors();
  }, [isRegistering, role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isRegistering) {
      // Register
      try {
        const payload = {
          name,
          email,
          password,
          role,
        };

        if (role === 'intern') {
          payload.mentorId = mentorId;
        }

        const res = await fetch(`${API_BASE}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          alert('Registration successful!');
          setIsRegistering(false);
          setName('');
          setRole('intern');
        } else {
          const errData = await res.json();
          setError(errData.message || 'Registration failed');
        }
      } catch (err) {
        setError('Something went wrong during registration');
      }
    } else {
      // Login
      const loginEndpoints = [
        { url: `${API_BASE}/api/auth/login`, userType: 'member' },
        { url: `${API_BASE}/api/mentors/login`, userType: 'mentor' },
      ];

      for (let endpoint of loginEndpoints) {
        try {
          const res = await fetch(endpoint.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (res.ok) {
            const data = await res.json();
            const user = data[endpoint.userType];

            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', user.role);
            localStorage.setItem('userId', user.id);
            localStorage.setItem('email', user.email);
            localStorage.setItem('name', user.name);

            onLogin(user.role);
            return;
          }
        } catch (err) {
          console.error(`Login failed at ${endpoint.url}`, err);
        }
      }

      setError('Invalid email or password');
    }
  };

  return (
    <div className='apple'>
      <div className="login-container">
        <img src={logo} alt="ResoluteAI" className="logo" />
        <h2>{isRegistering ? 'Register New User' : 'Intern\'s Task Management Application'}</h2>

        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <select className='select-value' value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="intern">Intern</option>
                <option value="mentor">Mentor</option>
              </select>

              {role === 'intern' && (
                <select className='select-value' value={mentorId} onChange={(e) => setMentorId(e.target.value)} required>
                  <option value="">Select Mentor</option>
                  {mentors.map((mentor) => (
                    <option key={mentor._id} value={mentor._id}>
                      {mentor.name}
                    </option>
                  ))}
                </select>
              )}
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="toggle-visibility"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? '🙈' : '👁'}
            </span>
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit">{isRegistering ? 'Register' : 'Login'}</button>
        </form>

       <p style={{ marginTop: '10px', fontSize: '14px' }}>
  {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
  <span
    onClick={() => setIsRegistering(!isRegistering)}
    className="auth-link"
  >
    {isRegistering ? 'Login here' : 'Register here'}
  </span>
</p>

      </div>
    </div>
  );
};

export default Login;
