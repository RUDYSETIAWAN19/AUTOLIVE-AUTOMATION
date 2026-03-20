const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  plan: {
    type: String,
    enum: ['free', 'pro', 'premium'],
    default: 'free'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  googleId: String,
  
  // Social accounts integration
  socialAccounts: {
    youtube: [{
      channelId: String,
      channelName: String,
      accessToken: String,
      refreshToken: String,
      isActive: { type: Boolean, default: true }
    }],
    tiktok: [{
      username: String,
      accessToken: String,
      isActive: { type: Boolean, default: true }
    }],
    facebook: [{
      pageId: String,
      pageName: String,
      accessToken: String,
      isActive: { type: Boolean, default: true }
    }],
    instagram: [{
      accountId: String,
      username: String,
      accessToken: String,
      isActive: { type: Boolean, default: true }
    }]
  },

  // Statistics
  stats: {
    totalViews: { type: Number, default: 0 },
    totalLikes: { type: Number, default: 0 },
    totalSubscribers: { type: Number, default: 0 },
    totalWatchTime: { type: Number, default: 0 },
    videosUploaded: { type: Number, default: 0 }
  },

  // Usage limits based on plan
  limits: {
    videosPerDay: { type: Number, default: 5 },
    maxAccounts: { type: Number, default: 1 },
    canAutomate: { type: Boolean, default: true },
    storage: { type: Number, default: 1024 * 1024 * 1024 } // 1GB default
  },

  // Profile
  profile: {
    avatar: String,
    bio: String,
    website: String,
    language: { type: String, default: 'id' }
  },

  // Settings
  settings: {
    notifications: {
      email: { type: Boolean, default: true },
      whatsapp: { type: Boolean, default: true }
    },
    theme: { type: String, default: 'light' }
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

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update limits based on plan
userSchema.methods.updateLimits = function() {
  switch(this.plan) {
    case 'free':
      this.limits = {
        videosPerDay: 5,
        maxAccounts: 1,
        canAutomate: true,
        storage: 1024 * 1024 * 1024 // 1GB
      };
      break;
    case 'pro':
      this.limits = {
        videosPerDay: 20,
        maxAccounts: 5,
        canAutomate: true,
        storage: 10 * 1024 * 1024 * 1024 // 10GB
      };
      break;
    case 'premium':
      this.limits = {
        videosPerDay: 100,
        maxAccounts: 20,
        canAutomate: true,
        storage: 100 * 1024 * 1024 * 1024 // 100GB
      };
      break;
  }
};

module.exports = mongoose.model('User', userSchema);
