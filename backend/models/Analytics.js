const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video'
  },
  platform: {
    type: String,
    enum: ['youtube', 'tiktok', 'facebook', 'instagram', 'total'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  metrics: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    subscribers: { type: Number, default: 0 },
    watchTime: { type: Number, default: 0 }, // in minutes
    revenue: { type: Number, default: 0 },
    clickThroughRate: { type: Number, default: 0 },
    engagementRate: { type: Number, default: 0 }
  },
  demographics: {
    ageGroups: {
      '13-17': { type: Number, default: 0 },
      '18-24': { type: Number, default: 0 },
      '25-34': { type: Number, default: 0 },
      '35-44': { type: Number, default: 0 },
      '45-54': { type: Number, default: 0 },
      '55+': { type: Number, default: 0 }
    },
    genders: {
      male: { type: Number, default: 0 },
      female: { type: Number, default: 0 },
      other: { type: Number, default: 0 }
    },
    countries: Map,
    devices: {
      mobile: { type: Number, default: 0 },
      desktop: { type: Number, default: 0 },
      tablet: { type: Number, default: 0 }
    }
  },
  traffic: {
    sources: Map,
    keywords: [{
      keyword: String,
      impressions: Number,
      clicks: Number
    }]
  },
  retention: [{
    timestamp: Number,
    views: Number
  }],
  predictions: {
    predictedViews: Number,
    predictedEngagement: Number,
    confidence: Number,
    recommendations: [String]
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

analyticsSchema.index({ userId: 1, date: -1 });
analyticsSchema.index({ videoId: 1, date: -1 });
analyticsSchema.index({ platform: 1, date: -1 });

analyticsSchema.statics.getDailyStats = async function(userId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        totalViews: { $sum: "$metrics.views" },
        totalLikes: { $sum: "$metrics.likes" },
        totalComments: { $sum: "$metrics.comments" },
        totalShares: { $sum: "$metrics.shares" },
        totalWatchTime: { $sum: "$metrics.watchTime" }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

analyticsSchema.statics.getPlatformComparison = async function(userId) {
  return this.aggregate([
    {
      $match: { userId: mongoose.Types.ObjectId(userId) }
    },
    {
      $group: {
        _id: "$platform",
        totalViews: { $sum: "$metrics.views" },
        totalLikes: { $sum: "$metrics.likes" },
        totalSubscribers: { $sum: "$metrics.subscribers" },
        avgEngagement: { $avg: "$metrics.engagementRate" }
      }
    }
  ]);
};

module.exports = mongoose.model('Analytics', analyticsSchema);
