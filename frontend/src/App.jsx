import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Homepage from './pages/Homepage';

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
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/homepage" element={<Homepage onLogout={handleLogout} />} />  {/* ← Use Homepage not HomePage */}
        <Route path="/" element={<Login onLogin={handleLogin} />} />
      </Routes>
    </BrowserRouter>
    </LanguageProvider>
  );
}


export default App;