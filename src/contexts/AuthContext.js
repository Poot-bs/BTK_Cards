import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { setAuthToken } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set up axios defaults
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setAuthToken(token);
    }
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    axios.defaults.baseURL = apiUrl;
    console.log('API URL set to:', apiUrl);
  }, []);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await axios.get('/auth/me');
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setAuthToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setAuthToken(token);
      setUser(user);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || error.message || 'Login failed';
      return { 
        success: false, 
        message 
      };
    }
  };

  const register = async (data) => {
    try {
      const response = await axios.post('/auth/register', data);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setAuthToken(token);
      setUser(user);

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      const message = error.response?.data?.message || error.message || 'Registration failed';
      return {
        success: false,
        message
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setAuthToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/auth/profile', profileData);
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      const message = error.response?.data?.message || error.message || 'Profile update failed';
      return { success: false, message };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await axios.post('/auth/change-password', { currentPassword, newPassword });
      return { success: true };
    } catch (error) {
      console.error('Password change error:', error);
      const message = error.response?.data?.message || error.message || 'Password change failed';
      return { success: false, message };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};