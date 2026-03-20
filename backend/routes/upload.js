const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { authMiddleware } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/rateLimiter');

// All routes require authentication
router.use(authMiddleware);

// File uploads
router.post('/video', uploadLimiter, uploadController.uploadVideo);
router.post('/thumbnail/:videoId', uploadLimiter, uploadController.uploadThumbnail);
router.post('/profile-picture', uploadLimiter, uploadController.uploadProfilePicture);

// Platform uploads
router.post('/platform/:videoId', uploadController.uploadToPlatform);
router.get('/status/:videoId/:uploadId', uploadController.getUploadStatus);
router.delete('/cancel/:videoId/:uploadId', uploadController.cancelUpload);

module.exports = router;
