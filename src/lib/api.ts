import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests from localStorage as fallback
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      const path = window.location.pathname;
      const publicPaths = ['/', '/login', '/register', '/forgot-password', '/reset-password'];
      if (!publicPaths.some(p => path === p || path.startsWith(p + '/'))) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
