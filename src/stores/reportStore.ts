import { create } from 'zustand';
import api from '@/lib/api';

export interface Report {
  id: string;
  title: string;
  content: string;
  type: 'daily' | 'custom';
  created_at: string;
}

interface ReportState {
  reports: Report[];
  isLoading: boolean;
  fetchReports: () => Promise<void>;
  createReport: (data: { title: string; content: string; type: 'daily' | 'custom' }) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
}

export const useReportStore = create<ReportState>((set, get) => ({
  reports: [],
  isLoading: false,

  fetchReports: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/reports');
      set({ reports: res.data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createReport: async (data) => {
    const res = await api.post('/reports', data);
    set({ reports: [res.data, ...get().reports] });
  },

  deleteReport: async (id) => {
    await api.delete(`/reports/${id}`);
    set({ reports: get().reports.filter(r => r.id !== id) });
  },
}));