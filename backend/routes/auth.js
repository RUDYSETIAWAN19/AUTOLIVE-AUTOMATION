const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const validators = require('../utils/validator');

// Public routes
router.post('/register', authLimiter, validators.register, validators.checkResult, authController.register);
router.post('/login', authLimiter, validators.login, validators.checkResult, authController.login);
router.post('/google-login', authLimiter, authController.googleLogin);
router.get('/verify-email', authController.verifyEmail);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);

// Protected routes
router.get('/me', authMiddleware, authController.getMe);
router.post('/logout', authMiddleware, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});
router.post('/refresh-token', authMiddleware, (req, res) => {
  // Implement refresh token logic
  const token = generateToken(req.user);
  res.json({ token });
});

module.exports = router;
