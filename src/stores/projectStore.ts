import { create } from 'zustand';
import api from '@/lib/api';
import { Project, ProjectBoard, GanttTask, Task } from '@/types';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  projectBoard: ProjectBoard | null;
  projectGantt: GanttTask[];
  projectTasks: Task[];
  isLoading: boolean;

  fetchProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  createProject: (data: Partial<Project>) => Promise<void>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  fetchProjectBoard: (id: string) => Promise<void>;
  fetchProjectGantt: (id: string) => Promise<void>;
  fetchProjectTasks: (id: string, status?: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  projectBoard: null,
  projectGantt: [],
  projectTasks: [],
  isLoading: false,

  fetchProjects: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get<Project[]>('/projects');
      set({ projects: res.data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchProject: async (id: string) => {
    try {
      const res = await api.get<Project>(`/projects/${id}`);
      set({ currentProject: res.data });
    } catch {
      // ignore
    }
  },

  createProject: async (data) => {
    await api.post('/projects', data);
    await get().fetchProjects();
  },

  updateProject: async (id, data) => {
    await api.put(`/projects/${id}`, data);
    await get().fetchProjects();
    await get().fetchProject(id);
  },

  deleteProject: async (id) => {
    await api.delete(`/projects/${id}`);
    await get().fetchProjects();
  },

  fetchProjectBoard: async (id: string) => {
    try {
      const res = await api.get<ProjectBoard>(`/projects/${id}/board`);
      set({ projectBoard: res.data });
    } catch {
      // ignore
    }
  },

  fetchProjectGantt: async (id: string) => {
    try {
      const res = await api.get<GanttTask[]>(`/projects/${id}/gantt`);
      set({ projectGantt: res.data });
    } catch {
      // ignore
    }
  },

  fetchProjectTasks: async (id: string, status?: string) => {
    try {
      const url = status ? `/projects/${id}/tasks?status=${status}` : `/projects/${id}/tasks`;
      const res = await api.get<Task[]>(url);
      set({ projectTasks: res.data });
    } catch {
      // ignore
    }
  },
}));
