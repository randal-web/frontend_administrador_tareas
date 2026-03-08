import { create } from 'zustand';
import api from '@/lib/api';
import { Habit } from '@/types';

interface HabitState {
  habits: Habit[];
  weeklyHabits: Habit[];
  isLoading: boolean;

  fetchHabits: () => Promise<void>;
  fetchWeeklyHabits: (weekStart?: string) => Promise<void>;
  createHabit: (data: Partial<Habit>) => Promise<void>;
  updateHabit: (id: string, data: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleLog: (habitId: string, date: string, weekStart?: string) => Promise<void>;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  weeklyHabits: [],
  isLoading: false,

  fetchHabits: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get<Habit[]>('/habits');
      set({ habits: res.data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchWeeklyHabits: async (weekStart?: string) => {
    try {
      const url = weekStart ? `/habits/weekly?week_start=${weekStart}` : '/habits/weekly';
      const res = await api.get<Habit[]>(url);
      set({ weeklyHabits: res.data });
    } catch {
      // ignore
    }
  },

  createHabit: async (data) => {
    await api.post('/habits', data);
    await get().fetchHabits();
    await get().fetchWeeklyHabits();
  },

  updateHabit: async (id, data) => {
    await api.put(`/habits/${id}`, data);
    await get().fetchHabits();
    await get().fetchWeeklyHabits();
  },

  deleteHabit: async (id) => {
    await api.delete(`/habits/${id}`);
    await get().fetchHabits();
    await get().fetchWeeklyHabits();
  },

  toggleLog: async (habitId, date, weekStart) => {
    await api.post(`/habits/${habitId}/toggle`, { date });
    await Promise.all([
      get().fetchWeeklyHabits(weekStart),
      get().fetchHabits(),
    ]);
  },
}));
