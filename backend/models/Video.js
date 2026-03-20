const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  originalUrl: String,
  source: {
    type: String,
    enum: ['youtube', 'tiktok', 'rednote', 'ai-generated', 'uploaded'],
    required: true
  },
  
  // Video files
  files: {
    original: String,
    processed: String,
    thumbnail: String,
    subtitle: String,
    audio: String
  },

  // Video metadata
  metadata: {
    duration: Number,
    resolution: String,
    size: Number,
    format: String
  },

  // Processing status
  status: {
    type: String,
    enum: ['pending', 'downloading', 'processing', 'completed', 'failed', 'uploading'],
    default: 'pending'
  },

  // AI Generated content
  aiContent: {
    script: String,
    voiceOver: String,
    music: String,
    images: [String]
  },

  // Thumbnail options
  thumbnails: [{
    url: String,
    text: String,
    selected: { type: Boolean, default: false }
  }],

  // Subtitle tracks
  subtitles: [{
    language: String,
    content: String,
    url: String
  }],

  // Automation job reference
  automationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Automation'
  },

  // Upload destinations
  uploads: [{
    platform: {
      type: String,
      enum: ['youtube', 'tiktok', 'facebook', 'instagram']
    },
    accountId: String,
    videoId: String,
    url: String,
    status: {
      type: String,
      enum: ['pending', 'uploading', 'completed', 'failed'],
      default: 'pending'
    },
    scheduledFor: Date,
    publishedAt: Date,
    error: String
  }],

  // Analytics
  analytics: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 }
  },

  // SEO and metadata for upload
  seo: {
    title: String,
    description: String,
    tags: [String],
    category: String,
    language: String
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

// Index for better query performance
videoSchema.index({ userId: 1, status: 1 });
videoSchema.index({ createdAt: -1 });
videoSchema.index({ 'uploads.scheduledFor': 1 });

module.exports = mongoose.model('Video', videoSchema);
