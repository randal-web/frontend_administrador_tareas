import { create } from 'zustand';
import api from '@/lib/api';
import { Reminder } from '@/types';

interface ReminderState {
  reminders: Reminder[];
  archivedReminders: Reminder[];
  isLoading: boolean;

  fetchReminders: () => Promise<void>;
  fetchArchivedReminders: () => Promise<void>;
  createReminder: (data: Partial<Reminder>) => Promise<void>;
  updateReminder: (id: string, data: Partial<Reminder>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
}

export const useReminderStore = create<ReminderState>((set, get) => ({
  reminders: [],
  archivedReminders: [],
  isLoading: false,

  fetchReminders: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get<Reminder[]>('/reminders');
      set({ reminders: res.data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchArchivedReminders: async () => {
    try {
      const res = await api.get<Reminder[]>('/reminders/archived');
      set({ archivedReminders: res.data });
    } catch {
      // ignore
    }
  },

  createReminder: async (data) => {
    await api.post('/reminders', data);
    await get().fetchReminders();
  },

  updateReminder: async (id, data) => {
    await api.put(`/reminders/${id}`, data);
    await get().fetchReminders();
  },

  deleteReminder: async (id) => {
    await api.delete(`/reminders/${id}`);
    await get().fetchReminders();
    await get().fetchArchivedReminders();
  },

  toggleComplete: async (id) => {
    await api.patch(`/reminders/${id}/toggle`);
    await get().fetchReminders();
    await get().fetchArchivedReminders();
  },
}));
