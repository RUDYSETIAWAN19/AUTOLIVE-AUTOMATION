import type { 
  User, Video, Platform, Schedule, Automation, 
  DashboardStats, MusicTrack, EditedVideo, Notification 
} from '@/types';

// ============== SERVICES / API LAYER ==============

// Base API service
const api = {
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`);
    if (params) {
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    }
    
    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  },

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  },

  async put<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  },

  async delete(endpoint: string): Promise<void> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
  },

  async uploadFile(endpoint: string, file: File, onProgress?: (progress: number) => void): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error('Upload failed'));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`);
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('auth_token')}`);
      xhr.send(formData);
    });
  }
};

// ============== USER SERVICE ==============

export const userService = {
  async getCurrentUser(): Promise<User | null> {
    try {
      return await api.get<User>('/users/me');
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      return null;
    }
  },

  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    return api.put<User>(`/users/${userId}`, data);
  },

  async updateSettings(userId: string, settings: Partial<User['settings']>): Promise<User> {
    return api.put<User>(`/users/${userId}/settings`, { settings });
  },

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await api.post<{ user: User; token: string }>('/auth/login', { email, password });
    localStorage.setItem('auth_token', response.token);
    return response;
  },

  async logout(): Promise<void> {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  async register(data: { email: string; password: string; name: string; whatsapp?: string }): Promise<{ user: User; token: string }> {
    const response = await api.post<{ user: User; token: string }>('/auth/register', data);
    localStorage.setItem('auth_token', response.token);
    return response;
  },

  async updateAvatar(userId: string, file: File): Promise<User> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload avatar');
    }

    return response.json();
  }
};

// ============== PLATFORM SERVICE ==============

export const platformService = {
  async getPlatforms(): Promise<Platform[]> {
    return api.get<Platform[]>('/platforms');
  },

  async connectPlatform(platform: string, authCode: string): Promise<Platform> {
    return api.post<Platform>('/platforms/connect', { platform, authCode });
  },

  async disconnectPlatform(platformId: string): Promise<void> {
    return api.delete(`/platforms/${platformId}`);
  },

  async refreshPlatformData(platformId: string): Promise<Platform> {
    return api.post<Platform>(`/platforms/${platformId}/refresh`, {});
  },

  async getOAuthUrl(platform: string): Promise<{ url: string }> {
    return api.get<{ url: string }>(`/platforms/${platform}/oauth-url`);
  }
};

// ============== VIDEO SERVICE ==============

export const videoService = {
  async getVideos(params?: {
    platform?: string;
    downloaded?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: 'views' | 'likes' | 'shares' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
  }): Promise<Video[]> {
    return api.get<Video[]>('/videos', params as any);
  },

  async getVideoById(videoId: string): Promise<Video> {
    return api.get<Video>(`/videos/${videoId}`);
  },

  async downloadVideo(videoId: string, platform: string, url: string): Promise<Video> {
    return api.post<Video>('/videos/download', { videoId, platform, url });
  },

  async deleteVideo(videoId: string): Promise<void> {
    return api.delete(`/videos/${videoId}`);
  },

  async searchVideos(query: string, platform?: string): Promise<Video[]> {
    return api.get<Video[]>('/videos/search', { q: query, platform });
  },

  async getViralVideos(threshold: number = 80, limit: number = 20): Promise<Video[]> {
    return api.get<Video[]>('/videos/viral', { threshold, limit });
  },

  async uploadVideo(file: File, onProgress?: (progress: number) => void): Promise<Video> {
    return api.uploadFile('/videos/upload', file, onProgress);
  },

  async updateVideoMetadata(videoId: string, metadata: Partial<Video>): Promise<Video> {
    return api.put<Video>(`/videos/${videoId}`, metadata);
  }
};

// ============== EDITED VIDEO SERVICE ==============

export const editedVideoService = {
  async getEditedVideos(params?: {
    status?: 'draft' | 'processing' | 'ready' | 'scheduled' | 'published';
    limit?: number;
    offset?: number;
  }): Promise<EditedVideo[]> {
    return api.get<EditedVideo[]>('/edited-videos', params as any);
  },

  async getEditedVideoById(editedVideoId: string): Promise<EditedVideo> {
    return api.get<EditedVideo>(`/edited-videos/${editedVideoId}`);
  },

  async createEditedVideo(data: {
    originalVideoId: string;
    editSettings: {
      ratio?: '9:16' | '1:1' | '16:9';
      addSubtitles?: boolean;
      subtitleLanguage?: string;
      addMusic?: boolean;
      musicId?: string;
      extractViralSegments?: boolean;
      viralThreshold?: number;
      trimStart?: number;
      trimEnd?: number;
    };
  }): Promise<EditedVideo> {
    return api.post<EditedVideo>('/edited-videos', data);
  },

  async updateEditedVideo(editedVideoId: string, data: Partial<EditedVideo>): Promise<EditedVideo> {
    return api.put<EditedVideo>(`/edited-videos/${editedVideoId}`, data);
  },

  async deleteEditedVideo(editedVideoId: string): Promise<void> {
    return api.delete(`/edited-videos/${editedVideoId}`);
  },

  async processVideo(editedVideoId: string): Promise<EditedVideo> {
    return api.post<EditedVideo>(`/edited-videos/${editedVideoId}/process`, {});
  },

  async addHashtags(editedVideoId: string, hashtags: string[]): Promise<EditedVideo> {
    return api.post<EditedVideo>(`/edited-videos/${editedVideoId}/hashtags`, { hashtags });
  },

  async generateHashtags(editedVideoId: string): Promise<string[]> {
    const response = await api.post<{ hashtags: string[] }>(`/edited-videos/${editedVideoId}/generate-hashtags`, {});
    return response.hashtags;
  },

  async getVideoFile(editedVideoId: string): Promise<Blob> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/edited-videos/${editedVideoId}/file`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch video file');
    }

    return response.blob();
  }
};

// ============== SCHEDULE SERVICE ==============

export const scheduleService = {
  async getSchedules(params?: {
    status?: 'pending' | 'processing' | 'completed' | 'failed';
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<Schedule[]> {
    const formattedParams = params ? {
      ...params,
      startDate: params.startDate?.toISOString(),
      endDate: params.endDate?.toISOString(),
    } : undefined;
    
    return api.get<Schedule[]>('/schedules', formattedParams as any);
  },

  async getScheduleById(scheduleId: string): Promise<Schedule> {
    return api.get<Schedule>(`/schedules/${scheduleId}`);
  },

  async createSchedule(data: {
    videoId: string;
    platforms: string[];
    scheduledTime: Date;
    title?: string;
    description?: string;
    hashtags?: string[];
  }): Promise<Schedule> {
    return api.post<Schedule>('/schedules', {
      ...data,
      scheduledTime: data.scheduledTime.toISOString(),
    });
  },

  async updateSchedule(scheduleId: string, data: Partial<Schedule>): Promise<Schedule> {
    const formattedData = data.scheduledTime 
      ? { ...data, scheduledTime: data.scheduledTime.toISOString() }
      : data;
    
    return api.put<Schedule>(`/schedules/${scheduleId}`, formattedData);
  },

  async deleteSchedule(scheduleId: string): Promise<void> {
    return api.delete(`/schedules/${scheduleId}`);
  },

  async cancelSchedule(scheduleId: string): Promise<Schedule> {
    return api.post<Schedule>(`/schedules/${scheduleId}/cancel`, {});
  },

  async getUpcomingSchedules(limit: number = 10): Promise<Schedule[]> {
    return api.get<Schedule[]>('/schedules/upcoming', { limit });
  }
};

// ============== AUTOMATION SERVICE ==============

export const automationService = {
  async getAutomations(): Promise<Automation[]> {
    return api.get<Automation[]>('/automations');
  },

  async getAutomationById(automationId: string): Promise<Automation> {
    return api.get<Automation>(`/automations/${automationId}`);
  },

  async createAutomation(data: Omit<Automation, 'id' | 'userId' | 'lastRun' | 'nextRun' | 'createdAt'>): Promise<Automation> {
    return api.post<Automation>('/automations', data);
  },

  async updateAutomation(automationId: string, data: Partial<Automation>): Promise<Automation> {
    return api.put<Automation>(`/automations/${automationId}`, data);
  },

  async deleteAutomation(automationId: string): Promise<void> {
    return api.delete(`/automations/${automationId}`);
  },

  async toggleAutomation(automationId: string, enabled: boolean): Promise<Automation> {
    return api.post<Automation>(`/automations/${automationId}/toggle`, { enabled });
  },

  async runAutomation(automationId: string): Promise<Automation> {
    return api.post<Automation>(`/automations/${automationId}/run`, {});
  },

  async getAutomationLogs(automationId: string, limit: number = 50): Promise<any[]> {
    return api.get(`/automations/${automationId}/logs`, { limit });
  }
};

// ============== MUSIC SERVICE ==============

export const musicService = {
  async getMusicTracks(params?: {
    category?: string;
    source?: 'youtube' | 'local';
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<MusicTrack[]> {
    return api.get<MusicTrack[]>('/music', params as any);
  },

  async getMusicById(musicId: string): Promise<MusicTrack> {
    return api.get<MusicTrack>(`/music/${musicId}`);
  },

  async uploadMusic(file: File, metadata: Partial<MusicTrack>): Promise<MusicTrack> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/music/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload music');
    }

    return response.json();
  },

  async deleteMusic(musicId: string): Promise<void> {
    return api.delete(`/music/${musicId}`);
  },

  async syncWithYouTube(): Promise<{ count: number }> {
    return api.post<{ count: number }>('/music/sync/youtube', {});
  },

  async getViralMusic(limit: number = 20): Promise<MusicTrack[]> {
    return api.get<MusicTrack[]>('/music/viral', { limit });
  },

  async getMusicPreview(musicId: string, startTime: number, duration: number): Promise<Blob> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/music/${musicId}/preview?start=${startTime}&duration=${duration}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch music preview');
    }

    return response.blob();
  }
};

// ============== NOTIFICATION SERVICE ==============

export const notificationService = {
  async getNotifications(params?: {
    read?: boolean;
    type?: string;
    limit?: number;
    offset?: number;
  }): Promise<Notification[]> {
    return api.get<Notification[]>('/notifications', params as any);
  },

  async markAsRead(notificationId: string): Promise<Notification> {
    return api.put<Notification>(`/notifications/${notificationId}/read`, {});
  },

  async markAllAsRead(): Promise<void> {
    return api.post('/notifications/mark-all-read', {});
  },

  async deleteNotification(notificationId: string): Promise<void> {
    return api.delete(`/notifications/${notificationId}`);
  },

  async deleteAllRead(): Promise<void> {
    return api.delete('/notifications/read');
  },

  async getUnreadCount(): Promise<{ count: number }> {
    return api.get<{ count: number }>('/notifications/unread/count');
  },

  async updateSettings(settings: {
    email: boolean;
    whatsapp: boolean;
    uploadSuccess: boolean;
    uploadFailed: boolean;
    scheduleReminder: boolean;
  }): Promise<void> {
    return api.put('/notifications/settings', settings);
  }
};

// ============== STATS SERVICE ==============

export const statsService = {
  async getDashboardStats(timeRange: 'day' | 'week' | 'month' | 'year' = 'week'): Promise<DashboardStats> {
    return api.get<DashboardStats>('/stats/dashboard', { timeRange });
  },

  async getViewsChart(platform?: string, days: number = 30): Promise<{ date: string; views: number }[]> {
    return api.get('/stats/charts/views', { platform, days });
  },

  async getEngagementChart(platform?: string, days: number = 30): Promise<{ date: string; engagement: number }[]> {
    return api.get('/stats/charts/engagement', { platform, days });
  },

  async getPlatformComparison(): Promise<{ platform: string; views: number; likes: number; shares: number }[]> {
    return api.get('/stats/platform-comparison');
  },

  async getTopVideos(limit: number = 10): Promise<Video[]> {
    return api.get('/stats/top-videos', { limit });
  }
};

// ============== HASHTAG SERVICE ==============

export const hashtagService = {
  async getTrendingHashtags(platform?: string): Promise<string[]> {
    return api.get<string[]>('/hashtags/trending', { platform });
  },

  async analyzeHashtags(hashtags: string[]): Promise<{ hashtag: string; popularity: number; competition: number }[]> {
    return api.post('/hashtags/analyze', { hashtags });
  },

  async generateHashtags(keywords: string[], count: number = 10): Promise<string[]> {
    return api.post<string[]>('/hashtags/generate', { keywords, count });
  },

  async getHashtagSuggestions(videoId: string): Promise<string[]> {
    return api.get<string[]>(`/hashtags/suggestions/${videoId}`);
  }
};

// ============== REACT HOOKS ==============

import { useState, useEffect, useCallback } from 'react';

// Generic data fetching hook
export function useData<T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setLoading(false);
    }
  }, dependencies);

  const refresh = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setRefreshing(false);
    }
  }, dependencies);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refresh, refreshing };
}

// User hook
export function useUser() {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await userService.getCurrentUser();
        setUser(userData);
        if (userData) {
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const updateUser = useCallback(async (data: Partial<User>) => {
    if (!user) return;
    try {
      const updated = await userService.updateUser(user.id, data);
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  }, [user]);

  const updateSettings = useCallback(async (settings: Partial<User['settings']>) => {
    if (!user) return;
    try {
      const updated = await userService.updateSettings(user.id, settings);
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  }, [user]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { user: userData, token } = await userService.login(email, password);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('auth_token', token);
      return userData;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await userService.logout();
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }, []);

  return { user, loading, updateUser, updateSettings, login, logout };
}

// Videos hook
export function useVideos(params?: {
  platform?: string;
  downloaded?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'views' | 'likes' | 'shares' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}) {
  const fetchVideos = useCallback(() => videoService.getVideos(params), [JSON.stringify(params)]);
  return useData(fetchVideos);
}

// Single video hook
export function useVideo(videoId: string) {
  const fetchVideo = useCallback(() => videoService.getVideoById(videoId), [videoId]);
  return useData(fetchVideo);
}

// Platforms hook
export function usePlatforms() {
  const fetchPlatforms = useCallback(() => platformService.getPlatforms(), []);
  const { data, ...rest } = useData(fetchPlatforms);

  const connectPlatform = useCallback(async (platform: string, authCode: string) => {
    try {
      const updated = await platformService.connectPlatform(platform, authCode);
      // Refresh data after connection
      rest.refresh();
      return updated;
    } catch (error) {
      console.error('Failed to connect platform:', error);
      throw error;
    }
  }, [rest.refresh]);

  const disconnectPlatform = useCallback(async (platformId: string) => {
    try {
      await platformService.disconnectPlatform(platformId);
      // Refresh data after disconnection
      rest.refresh();
    } catch (error) {
      console.error('Failed to disconnect platform:', error);
      throw error;
    }
  }, [rest.refresh]);

  return { 
    platforms: data, 
    connectPlatform, 
    disconnectPlatform,
    ...rest 
  };
}

// Schedules hook
export function useSchedules(params?: {
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  startDate?: Date;
  endDate?: Date;
}) {
  const fetchSchedules = useCallback(() => scheduleService.getSchedules(params), [JSON.stringify(params)]);
  const { data, ...rest } = useData(fetchSchedules);

  const createSchedule = useCallback(async (scheduleData: {
    videoId: string;
    platforms: string[];
    scheduledTime: Date;
    title?: string;
    description?: string;
    hashtags?: string[];
  }) => {
    try {
      const created = await scheduleService.createSchedule(scheduleData);
      rest.refresh();
      return created;
    } catch (error) {
      console.error('Failed to create schedule:', error);
      throw error;
    }
  }, [rest.refresh]);

  const cancelSchedule = useCallback(async (scheduleId: string) => {
    try {
      const cancelled = await scheduleService.cancelSchedule(scheduleId);
      rest.refresh();
      return cancelled;
    } catch (error) {
      console.error('Failed to cancel schedule:', error);
      throw error;
    }
  }, [rest.refresh]);

  return { 
    schedules: data, 
    createSchedule, 
    cancelSchedule,
    ...rest 
  };
}

// Automations hook
export function useAutomations() {
  const fetchAutomations = useCallback(() => automationService.getAutomations(), []);
  const { data, ...rest } = useData(fetchAutomations);

  const createAutomation = useCallback(async (data: Omit<Automation, 'id' | 'userId' | 'lastRun' | 'nextRun' | 'createdAt'>) => {
    try {
      const created = await automationService.createAutomation(data);
      rest.refresh();
      return created;
    } catch (error) {
      console.error('Failed to create automation:', error);
      throw error;
    }
  }, [rest.refresh]);

  const toggleAutomation = useCallback(async (automationId: string, enabled: boolean) => {
    try {
      const updated = await automationService.toggleAutomation(automationId, enabled);
      rest.refresh();
      return updated;
    } catch (error) {
      console.error('Failed to toggle automation:', error);
      throw error;
    }
  }, [rest.refresh]);

  return { 
    automations: data, 
    createAutomation, 
    toggleAutomation,
    ...rest 
  };
}

// Stats hook
export function useStats(timeRange: 'day' | 'week' | 'month' | 'year' = 'week') {
  const fetchStats = useCallback(() => statsService.getDashboardStats(timeRange), [timeRange]);
  return useData(fetchStats);
}

// Notifications hook
export function useNotifications(params?: {
  read?: boolean;
  type?: string;
  limit?: number;
  offset?: number;
}) {
  const fetchNotifications = useCallback(() => notificationService.getNotifications(params), [JSON.stringify(params)]);
  const { data, ...rest } = useData(fetchNotifications);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const updated = await notificationService.markAsRead(notificationId);
      rest.refresh();
      return updated;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }, [rest.refresh]);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      rest.refresh();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      throw error;
    }
  }, [rest.refresh]);

  return { 
    notifications: data, 
    markAsRead, 
    markAllAsRead,
    ...rest 
  };
}

// Music hook
export function useMusic(params?: {
  category?: string;
  source?: 'youtube' | 'local';
  search?: string;
}) {
  const fetchMusic = useCallback(() => musicService.getMusicTracks(params), [JSON.stringify(params)]);
  return useData(fetchMusic);
}

// Export all services
export const services = {
  user: userService,
  platform: platformService,
  video: videoService,
  editedVideo: editedVideoService,
  schedule: scheduleService,
  automation: automationService,
  music: musicService,
  notification: notificationService,
  stats: statsService,
  hashtag: hashtagService,
};

// Export types
export type {
  User,
  Video,
  Platform,
  Schedule,
  Automation,
  DashboardStats,
  MusicTrack,
  EditedVideo,
  Notification,
};

// Viral hashtags as a constant (can be used for fallback)
export const viralHashtags = [
  '#viral', '#trending', '#fyp', '#foryou', '#foryoupage',
  '#viralvideo', '#trend', '#popular', '#explore', '#discover',
  '#contentcreator', '#creator', '#influencer', '#socialmedia',
  '#instagram', '#tiktok', '#youtube', '#reels', '#shorts',
  '#funny', '#comedy', '#entertainment', '#meme', '#lol',
  '#tutorial', '#howto', '#tips', '#hacks', '#learn',
  '#motivation', '#inspiration', '#success', '#mindset', '#goals',
  '#fashion', '#style', '#ootd', '#beauty', '#makeup',
  '#food', '#foodie', '#cooking', '#recipe', '#yummy',
  '#travel', '#wanderlust', '#adventure', '#explore', '#vacation',
  '#fitness', '#gym', '#workout', '#health', '#wellness',
  '#music', '#dance', '#singing', '#cover', '#remix',
  '#art', '#drawing', '#painting', '#creative', '#diy',
  '#technology', '#tech', '#gadgets', '#review', '#unboxing',
  '#business', '#entrepreneur', '#marketing', '#startup', '#money',
  '#love', '#relationship', '#couple', '#romance', '#dating',
  '#pet', '#dog', '#cat', '#animal', '#cute',
];
