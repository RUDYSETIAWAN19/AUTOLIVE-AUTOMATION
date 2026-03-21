const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { ADMIN_EMAILS } = require('../models/User');

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { email, password, name, phoneNumber, socialAccounts, apiKeys } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Check if user is admin (auto detect)
    const isAdmin = ADMIN_EMAILS.includes(email);

    // Create user
    const user = new User({
      email,
      password,
      name,
      phoneNumber,
      role: isAdmin ? 'admin' : 'user',
      plan: 'free',
      isEmailVerified: true,
      apiKeys: apiKeys || {},
      socialAccounts: socialAccounts || []
    });

    await user.save();

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        plan: user.plan,
        isAdmin: user.isAdmin()
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last active
    await user.updateActivity();

    // Ensure admin role for admin emails
    if (ADMIN_EMAILS.includes(email) && user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        plan: user.plan,
        isAdmin: user.isAdmin(),
        preferences: user.preferences,
        apiKeysConfigured: {
          youtube: !!user.apiKeys?.youtube,
          facebook: !!user.apiKeys?.facebook,
          instagram: !!user.apiKeys?.instagram,
          tiktok: !!user.apiKeys?.tiktok
        },
        socialAccounts: user.socialAccounts.map(acc => ({
          provider: acc.provider,
          connected: true
        }))
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Google Login
// @route   POST /api/auth/google
// @access  Public
exports.googleLogin = async (req, res) => {
  try {
    const { googleId, email, name, picture } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      // Check if this email is admin
      const isAdmin = ADMIN_EMAILS.includes(email);
      
      user = new User({
        email,
        name,
        password: Math.random().toString(36),
        phoneNumber: '',
        role: isAdmin ? 'admin' : 'user',
        plan: 'free',
        isEmailVerified: true,
        socialAccounts: [{
          provider: 'google',
          accountId: googleId,
          email,
          name,
          connectedAt: new Date()
        }]
      });
      await user.save();
    } else {
      // Update existing user with Google account if not already connected
      const hasGoogle = user.socialAccounts.some(acc => acc.provider === 'google');
      if (!hasGoogle) {
        user.socialAccounts.push({
          provider: 'google',
          accountId: googleId,
          email,
          name,
          connectedAt: new Date()
        });
        await user.save();
      }
    }

    await user.updateActivity();

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        plan: user.plan,
        isAdmin: user.isAdmin(),
        picture: picture || null
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      ...user,
      isAdmin: user.role === 'admin' || ADMIN_EMAILS.includes(user.email),
      limits: req.user.getLimits(),
      apiKeysConfigured: {
        youtube: !!user.apiKeys?.youtube,
        facebook: !!user.apiKeys?.facebook,
        instagram: !!user.apiKeys?.instagram,
        tiktok: !!user.apiKeys?.tiktok
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user preferences
// @route   PUT /api/auth/preferences
// @access  Private
exports.updatePreferences = async (req, res) => {
  try {
    const { language, theme, notifications } = req.body;
    
    const updates = {};
    if (language) updates['preferences.language'] = language;
    if (theme) updates['preferences.theme'] = theme;
    if (notifications) updates['preferences.notifications'] = notifications;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates, updatedAt: new Date() },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Preferences updated',
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update API keys
// @route   PUT /api/auth/api-keys
// @access  Private
exports.updateApiKeys = async (req, res) => {
  try {
    const { youtube, facebook, instagram, tiktok } = req.body;
    
    const updates = {};
    if (youtube !== undefined) updates['apiKeys.youtube'] = youtube;
    if (facebook !== undefined) updates['apiKeys.facebook'] = facebook;
    if (instagram !== undefined) updates['apiKeys.instagram'] = instagram;
    if (tiktok !== undefined) updates['apiKeys.tiktok'] = tiktok;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates, updatedAt: new Date() },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'API keys updated',
      apiKeysConfigured: {
        youtube: !!user.apiKeys?.youtube,
        facebook: !!user.apiKeys?.facebook,
        instagram: !!user.apiKeys?.instagram,
        tiktok: !!user.apiKeys?.tiktok
      }
    });
  } catch (error) {
    console.error('Update API keys error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id);
    
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // In production, send email with reset link
    res.json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    // In production, verify token and update password
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    
    // In production, verify email token
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Logout (invalidate token)
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    // In production, blacklist the token
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
