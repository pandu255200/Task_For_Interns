// src/Login.jsx
import React, { useState } from 'react';
import './Login.css';
import logo from './logo.webp';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const API_BASE = process.env.REACT_APP_API_BASE_URL;
  const API_URL = 'http://localhost:5000'
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const error = await res.json();
        setError(error.error);
        return;
      }

      const data = await res.json();

      // Store the token, role, and name
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.member.role);
      localStorage.setItem('userId', data.member.id);
      localStorage.setItem('email', data.member.email);
      localStorage.setItem('name', data.member.name);

      // Redirect or handle after login
      onLogin(data.member.role);
    } catch (error) {
      console.error(error);
      setError(error.toString());  
    }
  };

  return (
    <div className='apple'>
      <div className="login-container">
        <img src={logo} alt="ResoluteAI" className="logo" />
        <h2>Intern's Task Management Application</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span 
              className="toggle-visibility"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? "🙈 " : "👁 "}
            </span>
          </div>

          {error && <p className="error">{error}</p>}
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;

