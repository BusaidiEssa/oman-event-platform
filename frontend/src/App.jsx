import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Dashboard from './components/dashboard/Dashboard';
import CreateEvent from './components/events/CreateEvent';

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
            }
          />
          <Route
            path="/signup"
            element={
              user ? <Navigate to="/dashboard" /> : <Signup />
            }
          />
          <Route
            path="/dashboard"
            element={
              user ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/create-event"
            element={
              user ? <CreateEvent /> : <Navigate to="/login" />
            }
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;