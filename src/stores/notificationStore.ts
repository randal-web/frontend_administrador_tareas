import { create } from 'zustand';
import api from '@/lib/api';
import { AppNotification } from '@/types';

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;

  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  generateNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  deleteAll: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get<AppNotification[]>('/notifications');
      set({ notifications: res.data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const res = await api.get<{ count: number }>('/notifications/unread-count');
      set({ unreadCount: res.data.count });
    } catch {
      // ignore
    }
  },

  generateNotifications: async () => {
    try {
      await api.post('/notifications/generate');
      await get().fetchNotifications();
      await get().fetchUnreadCount();
    } catch {
      // ignore
    }
  },

  markAsRead: async (id) => {
    await api.patch(`/notifications/${id}/read`);
    set(state => ({
      notifications: state.notifications.map(n => n.id === id ? { ...n, is_read: true } : n),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllAsRead: async () => {
    await api.patch('/notifications/read-all');
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, is_read: true })),
      unreadCount: 0,
    }));
  },

  deleteNotification: async (id) => {
    await api.delete(`/notifications/${id}`);
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id),
      unreadCount: state.notifications.find(n => n.id === id && !n.is_read)
        ? state.unreadCount - 1
        : state.unreadCount,
    }));
  },

  deleteAll: async () => {
    await api.delete('/notifications/all');
    set({ notifications: [], unreadCount: 0 });
  },
}));
