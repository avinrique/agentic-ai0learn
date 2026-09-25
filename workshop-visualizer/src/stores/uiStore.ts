import { create } from 'zustand';
import { PlayPace } from '@/lib/pacing';

interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  isFullscreen: boolean;
  setFullscreen: (fs: boolean) => void;
  toggleFullscreen: () => void;
  playPace: PlayPace;
  setPlayPace: (pace: PlayPace) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  isFullscreen: false,
  setFullscreen: (fs) => set({ isFullscreen: fs }),
  toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),
  playPace: 'normal',
  setPlayPace: (pace) => set({ playPace: pace }),
}));
