import { create } from 'zustand';
import api from '@/lib/api';
import { Note } from '@/types';

interface NoteState {
  notes: Note[];
  isLoading: boolean;

  fetchNotes: () => Promise<void>;
  createNote: (data: Partial<Note>) => Promise<void>;
  updateNote: (id: string, data: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  isLoading: false,

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
    await api.post('/notes', data);
    await get().fetchNotes();
  },

  updateNote: async (id, data) => {
    await api.put(`/notes/${id}`, data);
    await get().fetchNotes();
  },

  deleteNote: async (id) => {
    await api.delete(`/notes/${id}`);
    await get().fetchNotes();
  },

  togglePin: async (id) => {
    await api.patch(`/notes/${id}/pin`);
    await get().fetchNotes();
  },
}));
