const { uploadQueue } = require('../jobs/queue');
const Video = require('../models/Video');
const User = require('../models/User');
const UploadService = require('../services/UploadService');
const logger = require('../utils/logger');

class UploadWorker {
  constructor() {
    this.setupListeners();
  }

  setupListeners() {
    uploadQueue.on('completed', (job, result) => {
      logger.info(`Upload job ${job.id} completed`, { result });
    });

    uploadQueue.on('failed', (job, error) => {
      logger.error(`Upload job ${job.id} failed`, { error: error.message });
    });
  }

  async processJob(job) {
    const { videoId, userId, platform, accountId } = job.data;
    
    try {
      const video = await Video.findById(videoId);
      const user = await User.findById(userId);
      
      if (!video || !user) {
        throw new Error('Video or user not found');
      }
      
      // Get account
      const account = user.socialAccounts[platform]?.find(
        acc => acc._id.toString() === accountId
      );
      
      if (!account) {
        throw new Error('Account not found');
      }
      
      // Update status
      const upload = video.uploads.find(u => 
        u.platform === platform && u.accountId === accountId
      );
      
      if (upload) {
        upload.status = 'uploading';
        await video.save();
      }
      
      // Upload to platform
      let result;
      switch (platform) {
        case 'youtube':
          result = await UploadService.uploadToYouTube(
            video.files.processed,
            {
              title: video.seo?.title || video.title,
              description: video.seo?.description || video.description,
              tags: video.seo?.tags
            },
            account.accessToken
          );
          break;
          
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }
      
      if (result.success) {
        if (upload) {
          upload.status = 'completed';
          upload.videoId = result.videoId;
          upload.url = result.url;
          await video.save();
        }
        
        return { success: true, result };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      logger.error(`Error in upload worker: ${error.message}`);
      throw error;
    }
  }

  async start() {
    logger.info('Upload worker started');
    
    uploadQueue.process(async (job) => {
      return await this.processJob(job);
    });
  }
}

module.exports = new UploadWorker();
