import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './components/UI/ToastProvider';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CardCreator from './pages/CardCreator';
import CardView from './pages/CardView';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';

// Component to conditionally render header
const AppContent = () => {
  const location = useLocation();
  const isCardViewPage = location.pathname.startsWith('/card/');

  return (
    <div className="App bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors duration-200">
      {!isCardViewPage && <Header />}
            <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <CardCreator />
              </ProtectedRoute>
            }
          />
          <Route path="/card/:shortCode" element={<CardView />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
