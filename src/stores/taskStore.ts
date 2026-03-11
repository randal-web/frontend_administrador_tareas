import { create } from 'zustand';
import api from '@/lib/api';
import { Task, DaySummary } from '@/types';
import { getLocalDateString } from '@/lib/dateUtils';

interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  upcomingTasks: Task[];
  daySummary: DaySummary | null;
  isLoading: boolean;
  isMutating: boolean;
  currentDate: string;
  selectedTaskId: string | null;
  detailModalOpen: boolean;

  setCurrentDate: (date: string) => void;
  setSelectedTaskId: (id: string | null) => void;
  setDetailModalOpen: (open: boolean) => void;
  openTaskDetail: (id: string) => void;
  closeTaskDetail: () => void;
  fetchTasksByDate: (date: string) => Promise<void>;
  fetchUpcoming: (fromDate: string) => Promise<void>;
  fetchDaySummary: (date: string) => Promise<void>;
  fetchAllTasks: (filters?: Record<string, string>) => Promise<void>;
  fetchTask: (id: string) => Promise<void>;
  createTask: (data: Omit<Partial<Task>, 'subtasks'> & { subtasks?: { title: string }[] }) => Promise<void>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleStatus: (id: string, status: string) => Promise<void>;
  addSubtask: (taskId: string, title: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  deleteSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  addComment: (taskId: string, content: string) => Promise<void>;
  deleteComment: (taskId: string, commentId: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  currentTask: null,
  upcomingTasks: [],
  daySummary: null,
  isLoading: false,
  isMutating: false,
  currentDate: getLocalDateString(),
  selectedTaskId: null,
  detailModalOpen: false,

  setCurrentDate: (date: string) => set({ currentDate: date }),
  setSelectedTaskId: (id: string | null) => set({ selectedTaskId: id }),
  setDetailModalOpen: (open: boolean) => set({ detailModalOpen: open }),
  
  openTaskDetail: (id: string) => set({ selectedTaskId: id, detailModalOpen: true }),
  closeTaskDetail: () => set({ selectedTaskId: null, detailModalOpen: false }),

  fetchTasksByDate: async (date: string) => {
    set({ isLoading: true });
    try {
      const res = await api.get<Task[]>(`/tasks/date?date=${date}`);
      set({ tasks: res.data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchUpcoming: async (fromDate: string) => {
    try {
      const res = await api.get<Task[]>(`/tasks/upcoming?from=${fromDate}`);
      set({ upcomingTasks: res.data });
    } catch {
      // ignore
    }
  },

  fetchDaySummary: async (date: string) => {
    try {
      const res = await api.get<DaySummary>(`/tasks/summary?date=${date}`);
      set({ daySummary: res.data });
    } catch {
      // ignore
    }
  },

  fetchAllTasks: async (filters?: Record<string, string>) => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await api.get<Task[]>(`/tasks?${params}`);
      set({ tasks: res.data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchTask: async (id: string) => {
    try {
      const res = await api.get<Task>(`/tasks/${id}`);
      set({ currentTask: res.data });
    } catch {
      // ignore
    }
  },

  createTask: async (data) => {
    set({ isMutating: true });
    try {
      await api.post('/tasks', data);
      const { currentDate, fetchTasksByDate, fetchDaySummary, fetchUpcoming } = get();
      await fetchTasksByDate(currentDate);
      await fetchDaySummary(currentDate);
      await fetchUpcoming(currentDate);
    } finally {
      set({ isMutating: false });
    }
  },

  updateTask: async (id, data) => {
    set({ isMutating: true });
    try {
      await api.put(`/tasks/${id}`, data);
      const { currentDate, fetchTasksByDate, fetchDaySummary, fetchUpcoming } = get();
      await fetchTasksByDate(currentDate);
      await fetchDaySummary(currentDate);
      await fetchUpcoming(currentDate);
    } finally {
      set({ isMutating: false });
    }
  },

  deleteTask: async (id) => {
    set({ isMutating: true });
    try {
      await api.delete(`/tasks/${id}`);
      const { currentDate, fetchTasksByDate, fetchDaySummary, fetchUpcoming } = get();
      await fetchTasksByDate(currentDate);
      await fetchDaySummary(currentDate);
      await fetchUpcoming(currentDate);
    } finally {
      set({ isMutating: false });
    }
  },

  toggleStatus: async (id, status) => {
    set({ isMutating: true });
    try {
      await api.patch(`/tasks/${id}/status`, { status });
      const { currentDate, fetchTasksByDate, fetchDaySummary, fetchUpcoming, fetchTask } = get();
      await fetchTask(id);
      await fetchTasksByDate(currentDate);
      await fetchDaySummary(currentDate);
      await fetchUpcoming(currentDate);
    } finally {
      set({ isMutating: false });
    }
  },

  addSubtask: async (taskId, title) => {
    set({ isMutating: true });
    try {
      await api.post(`/tasks/${taskId}/subtasks`, { title });
      await get().fetchTask(taskId);
    } finally {
      set({ isMutating: false });
    }
  },

  toggleSubtask: async (taskId, subtaskId) => {
    set({ isMutating: true });
    try {
      await api.patch(`/tasks/${taskId}/subtasks/${subtaskId}/toggle`);
      await get().fetchTask(taskId);
      const { currentDate, fetchTasksByDate } = get();
      await fetchTasksByDate(currentDate);
    } finally {
      set({ isMutating: false });
    }
  },

  deleteSubtask: async (taskId, subtaskId) => {
    set({ isMutating: true });
    try {
      await api.delete(`/tasks/${taskId}/subtasks/${subtaskId}`);
      await get().fetchTask(taskId);
    } finally {
      set({ isMutating: false });
    }
  },

  addComment: async (taskId, content) => {
    set({ isMutating: true });
    try {
      await api.post(`/tasks/${taskId}/comments`, { content });
      await get().fetchTask(taskId);
    } finally {
      set({ isMutating: false });
    }
  },

  deleteComment: async (taskId, commentId) => {
    set({ isMutating: true });
    try {
      await api.delete(`/tasks/${taskId}/comments/${commentId}`);
      await get().fetchTask(taskId);
    } finally {
      set({ isMutating: false });
    }
  },
}));
