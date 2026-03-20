const { body, param, query, validationResult } = require('express-validator');

const validators = {
  // User validation
  register: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password')
      .isLength({ min: 8 })
      .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)
      .withMessage('Password must be at least 8 characters with 1 letter, 1 number, and 1 special character'),
    body('name').notEmpty().trim().isLength({ min: 2, max: 50 }),
    body('phoneNumber').optional().isMobilePhone()
  ],

  login: [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],

  updateProfile: [
    body('name').optional().trim().isLength({ min: 2, max: 50 }),
    body('phoneNumber').optional().isMobilePhone(),
    body('bio').optional().isLength({ max: 500 }),
    body('website').optional().isURL()
  ],

  // Video validation
  createVideo: [
    body('title').notEmpty().trim().isLength({ min: 3, max: 100 }),
    body('description').optional().isLength({ max: 5000 }),
    body('source').isIn(['youtube', 'tiktok', 'rednote', 'ai-generated', 'uploaded']),
    body('originalUrl').if(body('source').not().equals('uploaded')).isURL()
  ],

  updateVideo: [
    param('id').isMongoId(),
    body('title').optional().trim().isLength({ min: 3, max: 100 }),
    body('description').optional().isLength({ max: 5000 }),
    body('status').optional().isIn(['pending', 'processing', 'completed', 'failed'])
  ],

  // Automation validation
  createAutomation: [
    body('name').notEmpty().trim().isLength({ min: 3, max: 50 }),
    body('mode').isIn(['auto', 'manual']),
    body('source.platform').isIn(['youtube', 'tiktok', 'rednote', 'ai-generate']),
    body('source.keywords').optional().isArray(),
    body('processing.cropToVertical').optional().isBoolean(),
    body('upload.platforms').isArray()
  ],

  updateAutomation: [
    param('id').isMongoId(),
    body('status').optional().isIn(['active', 'paused', 'completed', 'failed'])
  ],

  // API Key validation
  createApiKey: [
    body('name').notEmpty().trim(),
    body('platform').isIn(['openai', 'youtube', 'tiktok', 'facebook', 'instagram', 'stability']),
    body('permissions').optional().isArray(),
    body('expiresAt').optional().isISO8601()
  ],

  // Job validation
  getJob: [
    param('id').isMongoId()
  ],

  // Analytics validation
  getAnalytics: [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('platform').optional().isIn(['youtube', 'tiktok', 'facebook', 'instagram', 'all'])
  ],

  // Admin validation
  updateUserPlan: [
    param('userId').isMongoId(),
    body('plan').isIn(['free', 'pro', 'premium']),
    body('duration').optional().isInt({ min: 1, max: 365 })
  ],

  // Upload validation
  uploadVideo: [
    body('title').notEmpty().trim().isLength({ min: 3, max: 100 }),
    body('platform').isIn(['youtube', 'tiktok', 'facebook', 'instagram']),
    body('scheduledFor').optional().isISO8601()
  ],

  // Custom validation
  isValidObjectId: (value) => {
    if (!value.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error('Invalid ID format');
    }
    return true;
  },

  isValidUrl: (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      throw new Error('Invalid URL');
    }
  },

  isValidVideoDuration: (value) => {
    if (value < 15 || value > 600) {
      throw new Error('Video duration must be between 15 seconds and 10 minutes');
    }
    return true;
  },

  // Check validation result
  checkResult: (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }
    next();
  }
};

module.exports = validators;
