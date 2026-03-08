import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  mobileSidebarOpen: boolean;
  searchTerm: string;
  isSearchOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;
  setSearchTerm: (term: string) => void;
  setIsSearchOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  mobileSidebarOpen: false,
  searchTerm: '',
  isSearchOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
  setMobileSidebarOpen: (open: boolean) => set({ mobileSidebarOpen: open }),
  toggleMobileSidebar: () => set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
  setSearchTerm: (term: string) => set({ searchTerm: term }),
  setIsSearchOpen: (open: boolean) => set({ isSearchOpen: open }),
}));
