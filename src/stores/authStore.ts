import { create } from 'zustand';
import api from '@/lib/api';
import { User, LoginData, RegisterData, AuthResponse } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (token: string, password: string) => Promise<string>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (data: LoginData) => {
    const res = await api.post<AuthResponse>('/auth/login', data);
    localStorage.setItem('token', res.data.token);
    set({ user: res.data.user, isAuthenticated: true });
  },

  register: async (data: RegisterData) => {
    const res = await api.post<AuthResponse>('/auth/register', data);
    localStorage.setItem('token', res.data.token);
    set({ user: res.data.user, isAuthenticated: true });
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Continue anyway
    }
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    try {
      const res = await api.get<User>('/auth/me');
      set({ user: res.data, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateProfile: async (data: Partial<User>) => {
    const res = await api.put<User>('/auth/profile', data);
    set({ user: res.data });
  },

  forgotPassword: async (email: string) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data.message;
  },

  resetPassword: async (token: string, password: string) => {
    const res = await api.post('/auth/reset-password', { token, password });
    return res.data.message;
  },
}));
