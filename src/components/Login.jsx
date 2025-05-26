import React, { useState } from 'react';
import './Login.css';
import logo from './logo.webp'

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

   
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('isLoggedIn', 'true');
      onLogin(); 
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className='apple'>
      <div className="login-container">
          <img src={logo} alt="ResoluteAI" className="logo" />
      <h2>Intern's Task Management Application</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
            placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="error">{error}</p>}
        <button type="submit">Login</button>
      </form>
      </div>
      </div>
  );
};

export default Login;
