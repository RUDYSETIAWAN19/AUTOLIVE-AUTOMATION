export const PLATFORMS = {
  YOUTUBE: 'youtube',
  TIKTOK: 'tiktok',
  INSTAGRAM: 'instagram',
  FACEBOOK: 'facebook',
  REDNOTE: 'rednote',
} as const;

export const VIDEO_STATUS = {
  PENDING: 'pending',
  DOWNLOADING: 'downloading',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  UPLOADING: 'uploading',
} as const;

export const AUTOMATION_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export const USER_PLANS = {
  FREE: 'free',
  PRO: 'pro',
  PREMIUM: 'premium',
} as const;

export const PLAN_LIMITS = {
  [USER_PLANS.FREE]: {
    videosPerDay: 5,
    maxAccounts: 1,
    storage: 1024 * 1024 * 1024, // 1GB
  },
  [USER_PLANS.PRO]: {
    videosPerDay: 20,
    maxAccounts: 5,
    storage: 10 * 1024 * 1024 * 1024, // 10GB
  },
  [USER_PLANS.PREMIUM]: {
    videosPerDay: 100,
    maxAccounts: 20,
    storage: 100 * 1024 * 1024 * 1024, // 100GB
  },
};

export const SUPPORTED_LANGUAGES = [
  { code: 'id', name: 'Bahasa Indonesia' },
  { code: 'en', name: 'English' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'ar', name: 'العربية' },
  { code: 'es', name: 'Español' },
];

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    GOOGLE: '/auth/google',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
  },
  USERS: {
    PROFILE: '/users/profile',
    STATS: '/users/stats',
    VIDEOS: '/users/videos',
    AUTOMATIONS: '/users/automations',
  },
  VIDEOS: {
    BASE: '/videos',
    PROCESS: (id: string) => `/videos/${id}/process`,
    AI_CONTENT: (id: string) => `/videos/${id}/ai-content`,
    THUMBNAIL: (id: string) => `/videos/${id}/thumbnail`,
    SUBTITLE: (id: string) => `/videos/${id}/subtitle`,
    ANALYTICS: (id: string) => `/videos/${id}/analytics`,
  },
  AUTOMATION: {
    BASE: '/automation',
    START: (id: string) => `/automation/${id}/start`,
    PAUSE: (id: string) => `/automation/${id}/pause`,
  },
  UPLOAD: {
    VIDEO: '/upload/video',
    THUMBNAIL: (id: string) => `/upload/thumbnail/${id}`,
    PLATFORM: (id: string) => `/upload/platform/${id}`,
    PROFILE_PICTURE: '/upload/profile-picture',
  },
  ADMIN: {
    USERS: '/admin/users',
    STATS: '/admin/stats',
    API_KEYS: '/admin/api-keys',
    SETTINGS: '/admin/settings',
  },
} as const;
