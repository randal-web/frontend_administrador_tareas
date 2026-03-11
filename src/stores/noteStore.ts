import { create } from 'zustand';
import api from '@/lib/api';
import { Note } from '@/types';

interface NoteState {
  notes: Note[];
  isLoading: boolean;
  isMutating: boolean;

  fetchNotes: () => Promise<void>;
  createNote: (data: Partial<Note>) => Promise<void>;
  updateNote: (id: string, data: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  toggleImportant: (id: string) => Promise<void>;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  isLoading: false,
  isMutating: false,

  fetchNotes: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get<Note[]>('/notes');
      set({ notes: res.data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createNote: async (data) => {
    set({ isMutating: true });
    try {
      await api.post('/notes', data);
      await get().fetchNotes();
    } finally {
      set({ isMutating: false });
    }
  },

  updateNote: async (id, data) => {
    set({ isMutating: true });
    try {
      await api.put(`/notes/${id}`, data);
      await get().fetchNotes();
    } finally {
      set({ isMutating: false });
    }
  },

  deleteNote: async (id) => {
    set({ isMutating: true });
    try {
      await api.delete(`/notes/${id}`);
      await get().fetchNotes();
    } finally {
      set({ isMutating: false });
    }
  },

  togglePin: async (id) => {
    set({ isMutating: true });
    try {
      await api.patch(`/notes/${id}/pin`);
      await get().fetchNotes();
    } finally {
      set({ isMutating: false });
    }
  },

  toggleImportant: async (id) => {
    set({ isMutating: true });
    try {
      await api.patch(`/notes/${id}/important`);
      await get().fetchNotes();
    } finally {
      set({ isMutating: false });
    }
  },
}));
