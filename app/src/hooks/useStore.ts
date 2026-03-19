import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Video, Platform, Schedule, Automation, EditedVideo, Notification, DashboardStats } from '@/types';
import { mockUser, mockPlatforms, mockVideos, mockSchedules, mockAutomations, mockStats, mockEditedVideos, mockNotifications } from '@/data/mock';

interface AppState {
  // User State
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, whatsapp: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  
  // Platform State
  platforms: Platform[];
  connectPlatform: (platformId: string) => void;
  disconnectPlatform: (platformId: string) => void;
  
  // Video State
  videos: Video[];
  editedVideos: EditedVideo[];
  addVideo: (video: Video) => void;
  updateVideo: (id: string, updates: Partial<Video>) => void;
  deleteVideo: (id: string) => void;
  addEditedVideo: (video: EditedVideo) => void;
  updateEditedVideo: (id: string, updates: Partial<EditedVideo>) => void;
  deleteEditedVideo: (id: string) => void;
  
  // Schedule State
  schedules: Schedule[];
  addSchedule: (schedule: Schedule) => void;
  updateSchedule: (id: string, updates: Partial<Schedule>) => void;
  deleteSchedule: (id: string) => void;
  
  // Automation State
  automations: Automation[];
  addAutomation: (automation: Automation) => void;
  updateAutomation: (id: string, updates: Partial<Automation>) => void;
  deleteAutomation: (id: string) => void;
  toggleAutomation: (id: string) => void;
  
  // Notification State
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  unreadCount: number;
  
  // Stats State
  stats: DashboardStats;
  updateStats: (stats: Partial<DashboardStats>) => void;
  
  // UI State
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: mockUser,
      isAuthenticated: true,
      platforms: mockPlatforms,
      videos: mockVideos,
      editedVideos: mockEditedVideos,
      schedules: mockSchedules,
      automations: mockAutomations,
      notifications: mockNotifications,
      stats: mockStats,
      activeTab: 'dashboard',
      isSidebarOpen: true,
      unreadCount: mockNotifications.filter(n => !n.read).length,
      
      // User Actions
      login: async (_email: string, _password: string) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        set({ user: mockUser, isAuthenticated: true });
        return true;
      },
      
      register: async (name: string, email: string, whatsapp: string, _password: string) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const newUser: User = {
          id: Date.now().toString(),
          email,
          whatsapp,
          name,
          plan: 'free',
          createdAt: new Date(),
          settings: {
            notifications: {
              email: true,
              whatsapp: true,
              uploadSuccess: true,
              uploadFailed: true,
              scheduleReminder: true,
            },
            autoCleanup: true,
            defaultPlatforms: [],
            preferredVideoRatio: '9:16',
          },
        };
        set({ user: newUser, isAuthenticated: true });
        return true;
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      
      updateUser: (updates) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...updates } });
        }
      },
      
      // Platform Actions
      connectPlatform: (platformId) => {
        const { platforms } = get();
        set({
          platforms: platforms.map(p =>
            p.id === platformId ? { ...p, connected: true } : p
          ),
        });
      },
      
      disconnectPlatform: (platformId) => {
        const { platforms } = get();
        set({
          platforms: platforms.map(p =>
            p.id === platformId ? { ...p, connected: false } : p
          ),
        });
      },
      
      // Video Actions
      addVideo: (video) => {
        set(state => ({ videos: [video, ...state.videos] }));
      },
      
      updateVideo: (id, updates) => {
        const { videos } = get();
        set({
          videos: videos.map(v => (v.id === id ? { ...v, ...updates } : v)),
        });
      },
      
      deleteVideo: (id) => {
        const { videos } = get();
        set({ videos: videos.filter(v => v.id !== id) });
      },
      
      addEditedVideo: (video) => {
        set(state => ({ editedVideos: [video, ...state.editedVideos] }));
      },
      
      updateEditedVideo: (id, updates) => {
        const { editedVideos } = get();
        set({
          editedVideos: editedVideos.map(v => (v.id === id ? { ...v, ...updates } : v)),
        });
      },
      
      deleteEditedVideo: (id) => {
        const { editedVideos } = get();
        set({ editedVideos: editedVideos.filter(v => v.id !== id) });
      },
      
      // Schedule Actions
      addSchedule: (schedule) => {
        set(state => ({ schedules: [schedule, ...state.schedules] }));
      },
      
      updateSchedule: (id, updates) => {
        const { schedules } = get();
        set({
          schedules: schedules.map(s => (s.id === id ? { ...s, ...updates } : s)),
        });
      },
      
      deleteSchedule: (id) => {
        const { schedules } = get();
        set({ schedules: schedules.filter(s => s.id !== id) });
      },
      
      // Automation Actions
      addAutomation: (automation) => {
        set(state => ({ automations: [automation, ...state.automations] }));
      },
      
      updateAutomation: (id, updates) => {
        const { automations } = get();
        set({
          automations: automations.map(a => (a.id === id ? { ...a, ...updates } : a)),
        });
      },
      
      deleteAutomation: (id) => {
        const { automations } = get();
        set({ automations: automations.filter(a => a.id !== id) });
      },
      
      toggleAutomation: (id) => {
        const { automations } = get();
        set({
          automations: automations.map(a =>
            a.id === id ? { ...a, enabled: !a.enabled } : a
          ),
        });
      },
      
      // Notification Actions
      addNotification: (notification) => {
        set(state => ({
          notifications: [notification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));
      },
      
      markNotificationAsRead: (id) => {
        const { notifications } = get();
        const updated = notifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        );
        set({
          notifications: updated,
          unreadCount: updated.filter(n => !n.read).length,
        });
      },
      
      deleteNotification: (id) => {
        const { notifications } = get();
        const updated = notifications.filter(n => n.id !== id);
        set({
          notifications: updated,
          unreadCount: updated.filter(n => !n.read).length,
        });
      },
      
      // Stats Actions
      updateStats: (updates) => {
        const { stats } = get();
        set({ stats: { ...stats, ...updates } });
      },
      
      // UI Actions
      setActiveTab: (tab) => set({ activeTab: tab }),
      toggleSidebar: () => set(state => ({ isSidebarOpen: !state.isSidebarOpen })),
    }),
    {
      name: 'viralcontent-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        platforms: state.platforms,
        automations: state.automations,
      }),
    }
  )
);
