const { uploadQueue } = require('./queue');
const Video = require('../models/Video');
const UploadService = require('../services/UploadService');
const User = require('../models/User');
const logger = require('../utils/logger');

uploadQueue.process(async (job) => {
  const { videoId, userId, platform, accountId, scheduledFor } = job.data;
  
  logger.info(`Processing upload job: ${videoId} to ${platform}`);
  
  try {
    const video = await Video.findById(videoId);
    const user = await User.findById(userId);
    
    if (!video || !user) {
      throw new Error('Video or user not found');
    }
    
    // Check if scheduled
    if (scheduledFor && new Date(scheduledFor) > new Date()) {
      // Reschedule job
      throw new Error('Reschedule for later');
    }
    
    // Get account credentials
    const account = user.socialAccounts[platform].find(
      acc => acc._id.toString() === accountId
    );
    
    if (!account) {
      throw new Error('Account not found');
    }
    
    // Update upload status
    const uploadRecord = video.uploads.find(u => 
      u.platform === platform && u.accountId === accountId
    );
    
    if (uploadRecord) {
      uploadRecord.status = 'uploading';
      await video.save();
    }
    
    // Upload based on platform
    let result;
    switch (platform) {
      case 'youtube':
        result = await UploadService.uploadToYouTube(
          video.files.processed,
          {
            title: video.seo?.title || video.title,
            description: video.seo?.description || video.description,
            tags: video.seo?.tags,
            privacyStatus: 'public'
          },
          account.accessToken
        );
        break;
        
      case 'tiktok':
        result = await UploadService.uploadToTikTok(
          video.files.processed,
          {
            description: video.seo?.description || video.description
          },
          account.accessToken
        );
        break;
        
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
    
    if (result.success) {
      // Update upload record
      if (uploadRecord) {
        uploadRecord.status = 'completed';
        uploadRecord.videoId = result.videoId;
        uploadRecord.url = result.url;
        uploadRecord.publishedAt = new Date();
        await video.save();
      }
      
      logger.info(`Upload completed: ${videoId} to ${platform}`);
      return { success: true, result };
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    logger.error(`Upload failed: ${videoId} to ${platform}`, error);
    
    // Update upload status
    const video = await Video.findById(videoId);
    if (video) {
      const uploadRecord = video.uploads.find(u => 
        u.platform === platform && u.accountId === accountId
      );
      
      if (uploadRecord) {
        uploadRecord.status = 'failed';
        uploadRecord.error = error.message;
        await video.save();
      }
    }
    
    throw error;
  }
});
