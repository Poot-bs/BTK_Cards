import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Use a dedicated axios instance with baseURL so requests work before AuthContext runs
const api = axios.create({ baseURL: API_URL });

// Cards API
export const cardAPI = {
  create: (formData) => api.post('/cards', formData),

  getByShortCode: (shortCode) => api.get(`/cards/${shortCode}`),

  getUserCards: () => api.get('/cards'),

  update: (id, formData) => api.put(`/cards/${id}`, formData),

  delete: (id) => api.delete(`/cards/${id}`)
};

// Admin API
export const adminAPI = {
  getAllCards: (page = 1, limit = 10) => 
    api.get(`/admin/cards?page=${page}&limit=${limit}`),

  getAllUsers: () => api.get('/admin/users'),

  getStats: () => api.get('/admin/stats'),

  updateCard: (id, formData) => api.put(`/admin/cards/${id}`, formData)
};

// Helper to set Authorization header on the api instance
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};