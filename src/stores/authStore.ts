import { create } from 'zustand';
import api from '@/lib/api';
import { User, LoginData, RegisterData, AuthResponse } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isMutating: boolean;
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
  isMutating: false,
  isAuthenticated: false,

  login: async (data: LoginData) => {
    set({ isMutating: true });
    try {
      const res = await api.post<AuthResponse>('/auth/login', data);
      set({ user: res.data.user, isAuthenticated: true });
    } finally {
      set({ isMutating: false });
    }
  },

  register: async (data: RegisterData) => {
    set({ isMutating: true });
    try {
      const res = await api.post<AuthResponse>('/auth/register', data);
      set({ user: res.data.user, isAuthenticated: true });
    } finally {
      set({ isMutating: false });
    }
  },

  logout: async () => {
    set({ isMutating: true });
    try {
      await api.post('/auth/logout');
    } catch {
      // Continue anyway
    } finally {
      set({ user: null, isAuthenticated: false, isMutating: false });
    }
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
    set({ isMutating: true });
    try {
      const res = await api.put<User>('/auth/profile', data);
      set({ user: res.data });
    } finally {
      set({ isMutating: false });
    }
  },

  forgotPassword: async (email: string) => {
    set({ isMutating: true });
    try {
      const res = await api.post('/auth/forgot-password', { email });
      return res.data.message;
    } finally {
      set({ isMutating: false });
    }
  },

  resetPassword: async (token: string, password: string) => {
    set({ isMutating: true });
    try {
      const res = await api.post('/auth/reset-password', { token, password });
      return res.data.message;
    } finally {
      set({ isMutating: false });
    }
  },
}));
