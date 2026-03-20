const User = require('../models/User');
const Video = require('../models/Video');
const Automation = require('../models/Automation');
const Analytics = require('../models/Analytics');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

// Get user profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updates = {
      name: req.body.name,
      phoneNumber: req.body.phoneNumber,
      profile: {
        bio: req.body.bio,
        website: req.body.website,
        language: req.body.language,
        avatar: req.body.avatar
      },
      settings: {
        notifications: req.body.notifications,
        theme: req.body.theme
      }
    };

    // Remove undefined fields
    Object.keys(updates).forEach(key => 
      updates[key] === undefined && delete updates[key]
    );

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    next(error);
  }
};

// Change password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

// Get user statistics
exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [totalVideos, totalAutomations, videoStats, analytics] = await Promise.all([
      Video.countDocuments({ userId }),
      Automation.countDocuments({ userId }),
      Video.aggregate([
        { $match: { userId: require('mongoose').Types.ObjectId(userId) } },
        { $group: {
          _id: null,
          totalViews: { $sum: '$analytics.views' },
          totalLikes: { $sum: '$analytics.likes' },
          totalComments: { $sum: '$analytics.comments' }
        }}
      ]),
      Analytics.aggregate([
        { $match: { userId: require('mongoose').Types.ObjectId(userId) } },
        { $group: {
          _id: null,
          totalWatchTime: { $sum: '$metrics.watchTime' },
          totalSubscribers: { $sum: '$metrics.subscribers' }
        }}
      ])
    ]);

    res.json({
      totalVideos,
      totalAutomations,
      stats: {
        totalViews: videoStats[0]?.totalViews || 0,
        totalLikes: videoStats[0]?.totalLikes || 0,
        totalComments: videoStats[0]?.totalComments || 0,
        totalWatchTime: analytics[0]?.totalWatchTime || 0,
        totalSubscribers: analytics[0]?.totalSubscribers || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user videos
exports.getUserVideos = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const videos = await Video.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Video.countDocuments({ userId: req.user.id });

    res.json({
      videos,
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

// Get user automations
exports.getUserAutomations = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const automations = await Automation.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Automation.countDocuments({ userId: req.user.id });

    res.json({
      automations,
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

// Add YouTube account
exports.addYouTubeAccount = async (req, res, next) => {
  try {
    const { channelId, channelName, accessToken, refreshToken } = req.body;

    const user = await User.findById(req.user.id);

    // Check account limit
    if (user.socialAccounts.youtube.length >= user.limits.maxAccounts) {
      return res.status(400).json({ message: 'Account limit reached' });
    }

    user.socialAccounts.youtube.push({
      channelId,
      channelName,
      accessToken,
      refreshToken,
      isActive: true
    });

    await user.save();

    res.json({ 
      message: 'YouTube account added successfully',
      accounts: user.socialAccounts.youtube 
    });
  } catch (error) {
    next(error);
  }
};

// Remove social account
exports.removeSocialAccount = async (req, res, next) => {
  try {
    const { platform, accountId } = req.params;

    const user = await User.findById(req.user.id);
    
    if (!user.socialAccounts[platform]) {
      return res.status(400).json({ message: 'Invalid platform' });
    }

    user.socialAccounts[platform] = user.socialAccounts[platform].filter(
      acc => acc._id.toString() !== accountId
    );

    await user.save();

    res.json({ 
      message: 'Account removed successfully',
      accounts: user.socialAccounts[platform] 
    });
  } catch (error) {
    next(error);
  }
};

// Update notification settings
exports.updateNotificationSettings = async (req, res, next) => {
  try {
    const { email, whatsapp } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        $set: { 
          'settings.notifications.email': email,
          'settings.notifications.whatsapp': whatsapp
        }
      },
      { new: true }
    ).select('-password');

    res.json({ 
      message: 'Notification settings updated',
      settings: user.settings 
    });
  } catch (error) {
    next(error);
  }
};

// Delete account
exports.deleteAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Delete all user data
    await Promise.all([
      Video.deleteMany({ userId: user._id }),
      Automation.deleteMany({ userId: user._id }),
      Analytics.deleteMany({ userId: user._id })
    ]);

    await user.deleteOne();

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
};
