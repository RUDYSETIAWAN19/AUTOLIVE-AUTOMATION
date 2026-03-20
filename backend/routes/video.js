const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const { authMiddleware } = require('../middleware/auth');
const { planBasedLimiter, videoLimiter } = require('../middleware/rateLimiter');
const validators = require('../utils/validator');

// All routes require authentication
router.use(authMiddleware);

// Video CRUD
router.post('/', planBasedLimiter, validators.createVideo, validators.checkResult, videoController.createVideo);
router.get('/', videoController.getVideos);
router.get('/:id', validators.isValidObjectId, videoController.getVideoById);
router.put('/:id', validators.updateVideo, validators.checkResult, videoController.updateVideo);
router.delete('/:id', videoController.deleteVideo);

// Video processing
router.post('/:id/process', videoLimiter, videoController.processVideo);
router.post('/:id/ai-content', videoController.generateAIContent);
router.post('/:id/thumbnail', videoController.generateThumbnail);
router.post('/:id/subtitle', videoController.addSubtitle);

// Analytics
router.get('/:id/analytics', videoController.getVideoAnalytics);

module.exports = router;
