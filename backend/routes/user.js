const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');
const { planBasedLimiter } = require('../middleware/rateLimiter');
const validators = require('../utils/validator');

// All routes require authentication
router.use(authMiddleware);

// Profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', validators.updateProfile, validators.checkResult, userController.updateProfile);
router.put('/change-password', userController.changePassword);
router.delete('/account', userController.deleteAccount);

// Statistics
router.get('/stats', userController.getStats);
router.get('/videos', userController.getUserVideos);
router.get('/automations', userController.getUserAutomations);

// Social accounts
router.post('/social/youtube', userController.addYouTubeAccount);
router.delete('/social/:platform/:accountId', userController.removeSocialAccount);

// Settings
router.put('/settings/notifications', userController.updateNotificationSettings);

module.exports = router;
