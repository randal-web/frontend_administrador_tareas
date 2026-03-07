import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const path = window.location.pathname;
      const publicPaths = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/auth/callback'];
      if (!publicPaths.some(p => path === p || path.startsWith(p + '/'))) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
