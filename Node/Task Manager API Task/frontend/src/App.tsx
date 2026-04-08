import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import MyTasks from './pages/MyTasks';
import Notifications from './pages/Notifications';
import Layout from './components/Layout';
import { ThemeProvider } from './context/theme';

import './App.css';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!localStorage.getItem('token')
  );

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  const protectedLayout = (element: React.ReactNode) =>
    isAuthenticated ? (
      <Layout onLogout={handleLogout}>{element}</Layout>
    ) : (
      <Navigate to="/login" />
    );

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen">
          <Routes>
            <Route
              path="/login"
              element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />}
            />
            <Route
              path="/register"
              element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />}
            />
            <Route path="/dashboard" element={protectedLayout(<Dashboard />)} />
            <Route path="/my-tasks" element={protectedLayout(<MyTasks />)} />
            <Route path="/notifications" element={protectedLayout(<Notifications />)} />
            <Route path="/settings" element={protectedLayout(<Settings />)} />
            <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;
