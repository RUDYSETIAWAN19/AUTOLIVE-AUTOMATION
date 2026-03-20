const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware } = require('../middleware/auth');
const { adminMiddleware } = require('../middleware/admin');
const { apiLimiter } = require('../middleware/rateLimiter');

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/:userId', adminController.getUserById);
router.put('/users/:userId', adminController.updateUser);
router.delete('/users/:userId', adminController.deleteUser);

// System stats
router.get('/stats', adminController.getSystemStats);

// API keys management
router.get('/api-keys', adminController.getApiKeys);
router.put('/api-keys', adminController.updateApiKey);

// System settings
router.get('/settings', adminController.getSystemSettings);
router.put('/settings', adminController.updateSystemSettings);

module.exports = router;
