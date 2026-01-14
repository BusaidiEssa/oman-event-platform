import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
// Import other components as needed

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
            path="/dashboard"
            element={
              user ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/login" />
            }
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;