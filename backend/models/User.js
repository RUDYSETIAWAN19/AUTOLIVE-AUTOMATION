const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Admin email list untuk auto detect
const ADMIN_EMAILS = [
  'rudysetiawan111@gmail.com',
  'marga.jaya.bird.shop@gmail.com',
  'autolive1.0.0@gmail.com'
];

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
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
    default: true
  },
  apiKeys: {
    youtube: { type: String, default: '' },
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    tiktok: { type: String, default: '' }
  },
  socialAccounts: [{
    provider: {
      type: String,
      enum: ['google', 'youtube', 'facebook', 'instagram', 'tiktok']
    },
    accountId: String,
    email: String,
    name: String,
    accessToken: String,
    refreshToken: String,
    connectedAt: { type: Date, default: Date.now }
  }],
  preferences: {
    language: { type: String, default: 'en' },
    theme: { type: String, default: 'light' },
    notifications: {
      email: { type: Boolean, default: true },
      whatsapp: { type: Boolean, default: false }
    }
  },
  usage: {
    videosUploaded: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },
    totalLikes: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now }
  }
}, {
  timestamps: true
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

// Update role based on email before saving
userSchema.pre('save', function(next) {
  if (ADMIN_EMAILS.includes(this.email)) {
    this.role = 'admin';
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    if (!candidatePassword || !this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

// Update last active
userSchema.methods.updateActivity = async function() {
  this.usage.lastActive = new Date();
  await this.save();
};

// Check if user is admin
userSchema.methods.isAdmin = function() {
  return this.role === 'admin' || ADMIN_EMAILS.includes(this.email);
};

// Get plan limits
userSchema.methods.getLimits = function() {
  const limits = {
    free: { videosPerDay: 5, maxAccounts: 1, storage: 1 * 1024 * 1024 * 1024 },
    pro: { videosPerDay: 20, maxAccounts: 5, storage: 10 * 1024 * 1024 * 1024 },
    premium: { videosPerDay: 100, maxAccounts: 20, storage: 100 * 1024 * 1024 * 1024 }
  };
  return limits[this.plan] || limits.free;
};

// Create model
const User = mongoose.model('User', userSchema);

// Export model and admin emails
module.exports = User;
module.exports.ADMIN_EMAILS = ADMIN_EMAILS;
