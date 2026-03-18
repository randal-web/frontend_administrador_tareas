import { create } from 'zustand';
import api from '@/lib/api';
import { Goal } from '@/types';

interface GoalState {
  goals: Goal[];
  isLoading: boolean;
  isMutating: boolean;

  fetchGoals: () => Promise<void>;
  createGoal: (data: Partial<Goal>) => Promise<void>;
  updateGoal: (id: string, data: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  toggleGoal: (id: string) => Promise<void>;
}

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],
  isLoading: false,
  isMutating: false,

  fetchGoals: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get<Goal[]>('/goals');
      set({ goals: res.data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createGoal: async (data) => {
    set({ isMutating: true });
    try {
      await api.post('/goals', data);
      await get().fetchGoals();
    } finally {
      set({ isMutating: false });
    }
  },

  updateGoal: async (id, data) => {
    set({ isMutating: true });
    try {
      await api.put(`/goals/${id}`, data);
      await get().fetchGoals();
    } finally {
      set({ isMutating: false });
    }
  },

  deleteGoal: async (id) => {
    set({ isMutating: true });
    try {
      await api.delete(`/goals/${id}`);
      await get().fetchGoals();
    } finally {
      set({ isMutating: false });
    }
  },

  toggleGoal: async (id) => {
    set({ isMutating: true });
    try {
      await api.patch(`/goals/${id}/toggle`);
      await get().fetchGoals();
    } finally {
      set({ isMutating: false });
    }
  },
}));
