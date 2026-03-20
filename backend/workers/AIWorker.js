const { aiQueue } = require('../jobs/queue');
const Video = require('../models/Video');
const AIService = require('../services/AIService');
const logger = require('../utils/logger');

class AIWorker {
  constructor() {
    this.setupListeners();
  }

  setupListeners() {
    aiQueue.on('completed', (job, result) => {
      logger.info(`AI job ${job.id} completed`, { result });
    });

    aiQueue.on('failed', (job, error) => {
      logger.error(`AI job ${job.id} failed`, { error: error.message });
    });
  }

  async processJob(job) {
    const { videoId, options } = job.data;
    
    try {
      const video = await Video.findById(videoId);
      
      if (!video) {
        throw new Error(`Video not found: ${videoId}`);
      }

      // Generate content based on options
      if (options.generateTitle) {
        const titles = await AIService.generateTitle(
          video.aiContent?.script || video.description
        );
        if (titles && titles.length > 0) {
          video.seo = video.seo || {};
          video.seo.title = titles[0];
          video.seo.alternativeTitles = titles.slice(1);
        }
      }
      
      if (options.generateDescription) {
        const description = await AIService.generateDescription(
          video.aiContent?.script || video.description,
          video.seo?.title || video.title
        );
        if (description) {
          video.seo = video.seo || {};
          video.seo.description = description;
        }
      }
      
      if (options.generateHashtags) {
        const hashtags = await AIService.generateHashtags(
          video.seo?.title || video.title,
          video.seo?.description || video.description
        );
        if (hashtags) {
          video.seo = video.seo || {};
          video.seo.tags = hashtags;
        }
      }
      
      if (options.generateScript && !video.aiContent?.script) {
        const script = await AIService.generateScript(
          options.topic || 'viral content'
        );
        if (script) {
          video.aiContent = video.aiContent || {};
          video.aiContent.script = script;
        }
      }
      
      await video.save();
      
      return { success: true, videoId };
    } catch (error) {
      logger.error(`Error in AI worker: ${error.message}`);
      throw error;
    }
  }

  async start() {
    logger.info('AI worker started');
    
    aiQueue.process(async (job) => {
      return await this.processJob(job);
    });
  }
}

module.exports = new AIWorker();
