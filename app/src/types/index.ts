// User Types
export interface User {
  id: string;
  email: string;
  whatsapp: string;
  name: string;
  avatar?: string;
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: Date;
  settings: UserSettings;
}

export interface UserSettings {
  notifications: {
    email: boolean;
    whatsapp: boolean;
    uploadSuccess: boolean;
    uploadFailed: boolean;
    scheduleReminder: boolean;
  };
  autoCleanup: boolean;
  defaultPlatforms: string[];
  preferredVideoRatio: '9:16' | '1:1' | '16:9';
}

// Video Types
export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  url: string;
  platform: 'youtube' | 'tiktok' | 'instagram' | 'facebook';
  viralScore: number;
  views: number;
  likes: number;
  shares: number;
  duration: number;
  downloaded: boolean;
  localPath?: string;
  createdAt: Date;
}

export interface EditedVideo {
  id: string;
  originalVideoId: string;
  title: string;
  description: string;
  thumbnail: string;
  localPath: string;
  duration: number;
  ratio: '9:16' | '1:1' | '16:9';
  hasSubtitles: boolean;
  musicSource?: string;
  viralSegments: ViralSegment[];
  hashtags: string[];
  status: 'editing' | 'ready' | 'scheduled' | 'uploaded' | 'failed';
  createdAt: Date;
}

export interface ViralSegment {
  startTime: number;
  endTime: number;
  score: number;
  reason: string;
}

// Schedule Types
export interface Schedule {
  id: string;
  videoId: string;
  platforms: string[];
  scheduledTime: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  errorMessage?: string;
}

// Platform Types
export interface Platform {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  accessToken?: string;
  username?: string;
  followers?: number;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'upload_success' | 'upload_failed' | 'schedule_reminder' | 'system';
  title: string;
  message: string;
  details?: Record<string, any>;
  read: boolean;
  sentToEmail: boolean;
  sentToWhatsApp: boolean;
  createdAt: Date;
}

// Automation Types
export interface Automation {
  id: string;
  userId: string;
  name: string;
  enabled: boolean;
  config: AutomationConfig;
  lastRun?: Date;
  nextRun?: Date;
  createdAt: Date;
}

export interface AutomationConfig {
  sourcePlatforms: string[];
  viralThreshold: number;
  autoDownload: boolean;
  autoEdit: boolean;
  editSettings: {
    ratio: '9:16' | '1:1' | '16:9';
    addSubtitles: boolean;
    addMusic: boolean;
    musicSource: 'youtube' | 'none';
    extractViralSegments: boolean;
  };
  autoGenerateMetadata: boolean;
  uploadPlatforms: string[];
  scheduleTimes: string[];
  cleanupAfterUpload: boolean;
}

// Stats Types
export interface DashboardStats {
  totalViews: number;
  engagementRate: number;
  scheduledPosts: number;
  followerGrowth: number;
  uploadedVideos: number;
  pendingUploads: number;
  failedUploads: number;
}

// Music Types
export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  duration: number;
  source: 'youtube' | 'upload';
  url?: string;
  localPath?: string;
  category: string;
  viralSegments: ViralSegment[];
}
