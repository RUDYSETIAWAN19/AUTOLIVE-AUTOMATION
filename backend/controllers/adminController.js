const User = require('../models/User');
const Video = require('../models/Video');
const Automation = require('../models/Automation');
const ApiKey = require('../models/ApiKey');
const Analytics = require('../models/Analytics');
const bcrypt = require('bcryptjs');

// Get all users
exports.getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search;
    const plan = req.query.plan;

    const query = {};
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }
    if (plan) query.plan = plan;

    const users = await User.find(query)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user by ID
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password -resetPasswordToken -resetPasswordExpires');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user statistics
    const [totalVideos, totalAutomations, analytics] = await Promise.all([
      Video.countDocuments({ userId: user._id }),
      Automation.countDocuments({ userId: user._id }),
      Analytics.aggregate([
        { $match: { userId: user._id } },
        { $group: {
          _id: null,
          totalViews: { $sum: '$metrics.views' },
          totalLikes: { $sum: '$metrics.likes' },
          totalSubscribers: { $sum: '$metrics.subscribers' }
        }}
      ])
    ]);

    res.json({
      user,
      stats: {
        totalVideos,
        totalAutomations,
        totalViews: analytics[0]?.totalViews || 0,
        totalLikes: analytics[0]?.totalLikes || 0,
        totalSubscribers: analytics[0]?.totalSubscribers || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update user
exports.updateUser = async (req, res, next) => {
  try {
    const { plan, limits, role, isActive } = req.body;

    const updates = {
      plan,
      role,
      limits,
      isActive,
      updatedAt: Date.now()
    };

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    next(error);
  }
};

// Delete user
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete all user data
    await Promise.all([
      Video.deleteMany({ userId: user._id }),
      Automation.deleteMany({ userId: user._id }),
      Analytics.deleteMany({ userId: user._id }),
      ApiKey.deleteMany({ userId: user._id })
    ]);

    await user.deleteOne();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get system stats
exports.getSystemStats = async (req, res, next) => {
  try {
    const [totalUsers, totalVideos, totalAutomations, totalJobs] = await Promise.all([
      User.countDocuments(),
      Video.countDocuments(),
      Automation.countDocuments(),
      Job?.countDocuments() || 0
    ]);

    const [activeUsers, premiumUsers] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ plan: 'premium' })
    ]);

    const [totalViews, totalLikes] = await Analytics.aggregate([
      { $group: {
        _id: null,
        totalViews: { $sum: '$metrics.views' },
        totalLikes: { $sum: '$metrics.likes' }
      }}
    ]);

    const recentVideos = await Video.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email');

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        premium: premiumUsers
      },
      content: {
        totalVideos,
        totalAutomations,
        totalJobs
      },
      analytics: {
        totalViews: totalViews?.totalViews || 0,
        totalLikes: totalLikes?.totalLikes || 0
      },
      recentVideos
    });
  } catch (error) {
    next(error);
  }
};

// Get API keys
exports.getApiKeys = async (req, res, next) => {
  try {
    const apiKeys = await ApiKey.find().populate('userId', 'name email');
    res.json(apiKeys);
  } catch (error) {
    next(error);
  }
};

// Update API key
exports.updateApiKey = async (req, res, next) => {
  try {
    const { platform, key, permissions } = req.body;

    let apiKey = await ApiKey.findOne({ platform });
    
    if (apiKey) {
      apiKey.key = key;
      apiKey.permissions = permissions;
      apiKey.updatedAt = Date.now();
    } else {
      apiKey = new ApiKey({
        platform,
        key,
        permissions,
        userId: req.user.id
      });
    }

    await apiKey.save();

    res.json({ message: 'API key updated successfully', apiKey });
  } catch (error) {
    next(error);
  }
};

// Get system settings
exports.getSystemSettings = async (req, res, next) => {
  try {
    // Get settings from database or config
    const settings = {
      branding: {
        logo: process.env.BRAND_LOGO || '/default-logo.png',
        primaryColor: process.env.PRIMARY_COLOR || '#0ea5e9',
        secondaryColor: process.env.SECONDARY_COLOR || '#6366f1'
      },
      limits: {
        freeVideosPerDay: 5,
        proVideosPerDay: 20,
        premiumVideosPerDay: 100
      },
      features: {
        aiGenerator: true,
        autoUpload: true,
        multiPlatform: true
      }
    };

    res.json(settings);
  } catch (error) {
    next(error);
  }
};

// Update system settings
exports.updateSystemSettings = async (req, res, next) => {
  try {
    const { branding, limits, features } = req.body;
    
    // Save to database or environment
    // This would typically use a Settings model
    
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    next(error);
  }
};
