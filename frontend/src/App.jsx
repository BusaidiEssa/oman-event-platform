import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import EventDashboard from './pages/EventDashboard';
import CreateEvent from './pages/CreateEvent';
import EventManagement from './pages/EventManagement';
import PublicRegistration from './pages/PublicRegistration';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem('token')
  );

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
  try {
    // Call the backend API to clear the HTTP-only token cookie
    await api.post('/auth/logout');
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    // Redirect user to the login page
    navigate('/login');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/signup" 
            element={
              isAuthenticated ? <Navigate to="/dashboard" /> : <Signup />
            } 
          />
          <Route path="/register/:eventSlug" element={<PublicRegistration />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <EventDashboard onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-event"
            element={
              <ProtectedRoute>
                <CreateEvent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/event/:eventSlug/manage"
            element={
              <ProtectedRoute>
                <EventManagement />
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
