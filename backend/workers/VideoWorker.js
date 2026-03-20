const { videoQueue } = require('../jobs/queue');
const Video = require('../models/Video');
const VideoProcessor = require('../services/VideoProcessor');
const SubtitleService = require('../services/SubtitleService');
const ThumbnailService = require('../services/ThumbnailService');
const logger = require('../utils/logger');

class VideoWorker {
  constructor() {
    this.setupListeners();
  }

  setupListeners() {
    videoQueue.on('completed', (job, result) => {
      logger.info(`Job ${job.id} completed`, { result });
    });

    videoQueue.on('failed', (job, error) => {
      logger.error(`Job ${job.id} failed`, { error: error.message });
    });

    videoQueue.on('progress', (job, progress) => {
      logger.info(`Job ${job.id} progress: ${progress}%`);
    });
  }

  async processJob(job) {
    const { videoId, options } = job.data;
    
    try {
      const video = await Video.findById(videoId);
      
      if (!video) {
        throw new Error(`Video not found: ${videoId}`);
      }

      // Update progress
      await job.progress(10);
      
      // Process video
      let processedPath = video.files.original;
      
      if (options.cropToVertical) {
        processedPath = await VideoProcessor.cropToVertical(processedPath);
        await job.progress(30);
      }
      
      if (options.addSubtitles) {
        const audioPath = await VideoProcessor.extractAudio(processedPath);
        const subtitles = await SubtitleService.generateSubtitles(audioPath);
        video.files.subtitle = subtitles.path;
        await job.progress(50);
      }
      
      if (options.addMusic) {
        processedPath = await VideoProcessor.addMusic(processedPath, options.musicPath);
        await job.progress(70);
      }
      
      if (options.generateThumbnail) {
        const thumbnail = await ThumbnailService.extractFrame(processedPath);
        video.thumbnails.push({ url: thumbnail });
        await job.progress(90);
      }
      
      // Save processed video
      video.files.processed = processedPath;
      video.status = 'completed';
      await video.save();
      
      await job.progress(100);
      
      return { success: true, videoId };
    } catch (error) {
      logger.error(`Error processing video job: ${error.message}`);
      throw error;
    }
  }

  async start() {
    logger.info('Video worker started');
    
    videoQueue.process(async (job) => {
      return await this.processJob(job);
    });
  }
}

module.exports = new VideoWorker();
