const { videoQueue } = require('./queue');
const Video = require('../models/Video');
const VideoProcessor = require('../services/VideoProcessor');
const SubtitleService = require('../services/SubtitleService');
const ThumbnailService = require('../services/ThumbnailService');
const logger = require('../utils/logger');

videoQueue.process(async (job) => {
  const { videoId, userId, options } = job.data;
  
  logger.info(`Processing video job: ${videoId}`);
  
  try {
    const video = await Video.findById(videoId);
    
    if (!video) {
      throw new Error(`Video not found: ${videoId}`);
    }
    
    // Update status
    video.status = 'processing';
    await video.save();
    
    // Process based on options
    if (options.cropToVertical) {
      video.files.processed = await VideoProcessor.cropToVertical(video.files.original);
    }
    
    if (options.addSubtitles) {
      // Extract audio for subtitle generation
      const audioPath = await VideoProcessor.extractAudio(video.files.processed);
      const subtitles = await SubtitleService.generateSubtitles(audioPath);
      video.files.subtitle = subtitles.path;
      video.subtitles.push({
        language: subtitles.language,
        content: subtitles.content,
        url: subtitles.path
      });
    }
    
    if (options.addMusic) {
      // Add background music
      video.files.audio = await VideoProcessor.addMusic(
        video.files.processed,
        options.musicPath || '/default/music.mp3'
      );
    }
    
    if (options.generateThumbnail) {
      const thumbnail = await ThumbnailService.extractFrame(video.files.processed);
      video.thumbnails.push({
        url: thumbnail,
        selected: video.thumbnails.length === 0
      });
    }
    
    // Update video status
    video.status = 'completed';
    video.metadata = await VideoProcessor.getMetadata(video.files.processed);
    await video.save();
    
    logger.info(`Video processing completed: ${videoId}`);
    
    return { success: true, videoId };
  } catch (error) {
    logger.error(`Video processing failed: ${videoId}`, error);
    
    const video = await Video.findById(videoId);
    if (video) {
      video.status = 'failed';
      await video.save();
    }
    
    throw error;
  }
});
