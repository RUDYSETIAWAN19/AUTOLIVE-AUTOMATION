const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Video = require('../models/Video');
const UploadService = require('../services/UploadService');
const { addUploadJob } = require('../jobs/queue');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/temp');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|mkv|webm/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images and videos are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
  fileFilter: fileFilter
}).single('file');

// Upload video
exports.uploadVideo = async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const { title, description, tags, category } = req.body;

      const video = new Video({
        userId: req.user.id,
        title,
        description,
        source: 'uploaded',
        files: {
          original: req.file.path
        },
        seo: {
          title,
          description,
          tags: tags ? tags.split(',') : [],
          category
        },
        status: 'pending'
      });

      await video.save();

      res.status(201).json({
        message: 'Video uploaded successfully',
        video: {
          id: video._id,
          title: video.title,
          status: video.status
        }
      });
    } catch (error) {
      // Clean up uploaded file on error
      if (req.file) {
        await fs.unlink(req.file.path).catch(console.error);
      }
      next(error);
    }
  });
};

// Upload thumbnail
exports.uploadThumbnail = async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      const videoId = req.params.videoId;
      const video = await Video.findById(videoId);

      if (!video) {
        return res.status(404).json({ message: 'Video not found' });
      }

      if (video.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      video.thumbnails.push({
        url: req.file.path,
        text: req.body.text || '',
        selected: true
      });

      // Unselect previous thumbnails
      if (video.thumbnails.length > 1) {
        video.thumbnails.forEach((thumb, index) => {
          if (index !== video.thumbnails.length - 1) {
            thumb.selected = false;
          }
        });
      }

      await video.save();

      res.json({
        message: 'Thumbnail uploaded successfully',
        thumbnail: video.thumbnails[video.thumbnails.length - 1]
      });
    } catch (error) {
      if (req.file) {
        await fs.unlink(req.file.path).catch(console.error);
      }
      next(error);
    }
  });
};

// Upload to platform
exports.uploadToPlatform = async (req, res, next) => {
  try {
    const videoId = req.params.videoId;
    const { platform, accountId, scheduledFor } = req.body;

    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    if (video.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!video.files.processed) {
      return res.status(400).json({ message: 'Video not processed yet' });
    }

    // Check if already uploaded to this platform
    const existingUpload = video.uploads.find(u => 
      u.platform === platform && u.accountId === accountId
    );

    if (existingUpload && existingUpload.status === 'completed') {
      return res.status(400).json({ message: 'Video already uploaded to this platform' });
    }

    // Add upload record
    const uploadRecord = {
      platform,
      accountId,
      status: 'pending',
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null
    };

    video.uploads.push(uploadRecord);
    await video.save();

    // Add to upload queue
    await addUploadJob({
      videoId: video._id,
      userId: req.user.id,
      platform,
      accountId,
      scheduledFor: uploadRecord.scheduledFor
    });

    res.json({
      message: 'Video queued for upload',
      uploadId: video.uploads[video.uploads.length - 1]._id
    });
  } catch (error) {
    next(error);
  }
};

// Get upload status
exports.getUploadStatus = async (req, res, next) => {
  try {
    const videoId = req.params.videoId;
    const uploadId = req.params.uploadId;

    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const upload = video.uploads.id(uploadId);

    if (!upload) {
      return res.status(404).json({ message: 'Upload not found' });
    }

    res.json({
      status: upload.status,
      videoId: upload.videoId,
      url: upload.url,
      publishedAt: upload.publishedAt,
      error: upload.error
    });
  } catch (error) {
    next(error);
  }
};

// Cancel upload
exports.cancelUpload = async (req, res, next) => {
  try {
    const videoId = req.params.videoId;
    const uploadId = req.params.uploadId;

    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const upload = video.uploads.id(uploadId);

    if (!upload) {
      return res.status(404).json({ message: 'Upload not found' });
    }

    if (upload.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot cancel upload in progress' });
    }

    upload.status = 'cancelled';
    await video.save();

    res.json({ message: 'Upload cancelled successfully' });
  } catch (error) {
    next(error);
  }
};

// Upload profile picture
exports.uploadProfilePicture = async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const user = await User.findById(req.user.id);
      
      // Delete old avatar if exists
      if (user.profile.avatar) {
        try {
          await fs.unlink(user.profile.avatar);
        } catch (err) {
          console.error('Error deleting old avatar:', err);
        }
      }

      user.profile.avatar = req.file.path;
      await user.save();

      res.json({
        message: 'Profile picture updated',
        avatar: user.profile.avatar
      });
    } catch (error) {
      if (req.file) {
        await fs.unlink(req.file.path).catch(console.error);
      }
      next(error);
    }
  });
};
