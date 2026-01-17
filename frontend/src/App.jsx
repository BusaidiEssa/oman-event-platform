import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import EventDashboard from './pages/Dashboard';
import CreateEvent from './pages/CreateEvent';
import PublicRegistration from './pages/PublicRegistration';
import EventAnalytics from './pages/EventAnalytics';
import QRScanner from './pages/QRScanner';
import api from './api/axios';

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/register/:eventSlug" element={<PublicRegistration />} />
          
          {/* Protected Routes - Manager Portal */}
          <Route 
            path="/dashboard" 
            element={user ? <EventDashboard onLogout={handleLogout} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/create-event" 
            element={user ? <CreateEvent /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/event/:eventId/analytics" 
            element={user ? <EventAnalytics /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/event/:eventId/checkin" 
            element={user ? <QRScanner /> : <Navigate to="/login" />} 
          />
          
          {/* Default Routes */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;