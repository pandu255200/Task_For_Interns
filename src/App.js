import React, { useState, useEffect } from 'react';
import Tasks from './components/Tasks';
import Login from './components/Login';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('isLoggedIn');
    setIsLoggedIn(auth === 'true');
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <div>
      {isLoggedIn ? <Tasks /> : <Login onLogin={handleLogin} />}
    </div>
  );
};

export default App;
