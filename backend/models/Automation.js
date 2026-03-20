const mongoose = require('mongoose');

const automationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: String,
  mode: {
    type: String,
    enum: ['auto', 'manual'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'failed'],
    default: 'active'
  },

  // Source configuration
  source: {
    platform: {
      type: String,
      enum: ['youtube', 'tiktok', 'rednote', 'ai-generate']
    },
    keywords: [String],
    themes: [String],
    duration: {
      min: Number,
      max: Number
    },
    viralScore: {
      type: Number,
      min: 0,
      max: 100
    }
  },

  // Processing configuration
  processing: {
    cropToVertical: { type: Boolean, default: true },
    removeWatermark: { type: Boolean, default: true },
    addSubtitles: { type: Boolean, default: true },
    subtitleLanguages: [String],
    addMusic: { type: Boolean, default: false },
    musicGenre: String,
    generateThumbnail: { type: Boolean, default: true },
    thumbnailText: String
  },

  // AI Configuration
  ai: {
    generateTitle: { type: Boolean, default: true },
    generateDescription: { type: Boolean, default: true },
    generateTags: { type: Boolean, default: true },
    generateScript: { type: Boolean, default: false },
    voiceType: String,
    language: String
  },

  // Upload configuration
  upload: {
    platforms: [{
      type: String,
      enum: ['youtube', 'tiktok', 'facebook', 'instagram']
    }],
    schedule: {
      type: {
        type: String,
        enum: ['manual', 'auto', 'random']
      },
      timeSlot: String,
      interval: Number // in minutes
    },
    accountRotation: { type: Boolean, default: false },
    delayBetweenUploads: { type: Number, default: 300 } // 5 minutes default
  },

  // Schedule
  schedule: {
    isScheduled: { type: Boolean, default: false },
    startDate: Date,
    endDate: Date,
    daysOfWeek: [Number], // 0-6, Sunday = 0
    timeOfDay: String // HH:mm format
  },

  // Statistics
  stats: {
    videosProcessed: { type: Number, default: 0 },
    videosUploaded: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 }
  },

  // Current job
  currentJob: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Automation', automationSchema);
