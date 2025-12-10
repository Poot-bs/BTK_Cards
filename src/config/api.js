// Use environment variable if available, otherwise fallback to production URL
// IMPORTANT: Update this URL after deploying your backend to Render
const BASE_URL = process.env.REACT_APP_API_URL || 'https://btk-cards-backend.onrender.com/api';

export const API_CONFIG = {
  BASE_URL: BASE_URL,
  ENDPOINTS: {
    AUTH: {
      REGISTER: '/auth/register',
      LOGIN: '/auth/login',
      ME: '/auth/me',
      PROFILE: '/auth/profile',
      CHANGE_PASSWORD: '/auth/change-password',
      TEST: '/auth/test',
    },
    CARDS: {
      CREATE: '/cards',
      LIST: '/cards',
      GET: (id) => `/cards/${id}`,
      UPDATE: (id) => `/cards/${id}`,
      DELETE: (id) => `/cards/${id}`,
    },
    ADMIN: {
      STATS: '/admin/stats',
      CARDS: '/admin/cards',
      USERS: '/admin/users',
      UPDATE_CARD: (id) => `/admin/cards/${id}`,
      TEST: '/admin/test',
    }
  }
};

// Health check endpoint
export const HEALTH_CHECK_URL = `${API_CONFIG.BASE_URL}/health`;

// Log the API URL in development mode (helps with debugging)
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 API Base URL:', API_CONFIG.BASE_URL);
}