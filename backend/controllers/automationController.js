const Automation = require('../models/Automation');
const Video = require('../models/Video');
const Job = require('../models/Job');
const { addVideoProcessingJob, addAIProcessingJob } = require('../jobs/queue');
const AIService = require('../services/AIService');
const ScraperService = require('../services/ScraperService');

// Create automation
exports.createAutomation = async (req, res, next) => {
  try {
    const automationData = {
      ...req.body,
      userId: req.user.id,
      status: 'active'
    };

    const automation = new Automation(automationData);
    await automation.save();

    // If scheduled, set up scheduling
    if (automation.schedule.isScheduled) {
      await setupAutomationSchedule(automation);
    }

    res.status(201).json({
      message: 'Automation created successfully',
      automation
    });
  } catch (error) {
    next(error);
  }
};

// Get all automations
exports.getAutomations = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const query = { userId: req.user.id };
    if (status) query.status = status;

    const automations = await Automation.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Automation.countDocuments(query);

    res.json({
      automations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get automation by ID
exports.getAutomationById = async (req, res, next) => {
  try {
    const automation = await Automation.findById(req.params.id);
    
    if (!automation) {
      return res.status(404).json({ message: 'Automation not found' });
    }

    if (automation.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(automation);
  } catch (error) {
    next(error);
  }
};

// Update automation
exports.updateAutomation = async (req, res, next) => {
  try {
    const automation = await Automation.findById(req.params.id);
    
    if (!automation) {
      return res.status(404).json({ message: 'Automation not found' });
    }

    if (automation.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updates = {
      ...req.body,
      updatedAt: Date.now()
    };

    const updatedAutomation = await Automation.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Automation updated successfully',
      automation: updatedAutomation
    });
  } catch (error) {
    next(error);
  }
};

// Delete automation
exports.deleteAutomation = async (req, res, next) => {
  try {
    const automation = await Automation.findById(req.params.id);
    
    if (!automation) {
      return res.status(404).json({ message: 'Automation not found' });
    }

    if (automation.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await automation.deleteOne();

    res.json({ message: 'Automation deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Start automation
exports.startAutomation = async (req, res, next) => {
  try {
    const automation = await Automation.findById(req.params.id);
    
    if (!automation) {
      return res.status(404).json({ message: 'Automation not found' });
    }

    if (automation.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    automation.status = 'active';
    await automation.save();

    // Execute automation
    await executeAutomation(automation);

    res.json({ message: 'Automation started' });
  } catch (error) {
    next(error);
  }
};

// Pause automation
exports.pauseAutomation = async (req, res, next) => {
  try {
    const automation = await Automation.findById(req.params.id);
    
    if (!automation) {
      return res.status(404).json({ message: 'Automation not found' });
    }

    if (automation.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    automation.status = 'paused';
    await automation.save();

    res.json({ message: 'Automation paused' });
  } catch (error) {
    next(error);
  }
};

// Execute automation (core logic)
async function executeAutomation(automation) {
  try {
    let sourceVideos = [];

    // Get videos from source
    if (automation.source.platform === 'ai-generate') {
      // Generate AI video
      const script = await AIService.generateScript(
        automation.source.themes[0] || 'viral content',
        'engaging'
      );
      
      const video = await createAIVideo(automation.userId, script, automation);
      sourceVideos.push(video);
    } else {
      // Scrape from platform
      sourceVideos = await ScraperService.scrapeVideos({
        platform: automation.source.platform,
        keywords: automation.source.keywords,
        maxResults: 5,
        minDuration: automation.source.duration?.min,
        maxDuration: automation.source.duration?.max
      });
    }

    // Process each video
    for (const sourceVideo of sourceVideos) {
      // Download video
      const downloadedVideo = await ScraperService.downloadVideo(
        sourceVideo.url,
        automation.source.platform
      );

      // Create video record
      const video = new Video({
        userId: automation.userId,
        title: sourceVideo.title,
        description: sourceVideo.description,
        originalUrl: sourceVideo.url,
        source: automation.source.platform,
        files: { original: downloadedVideo.path },
        automationId: automation._id,
        status: 'downloading'
      });
      await video.save();

      // Add to processing queue
      await addVideoProcessingJob({
        videoId: video._id,
        userId: automation.userId,
        type: 'process',
        options: {
          cropToVertical: automation.processing.cropToVertical,
          addSubtitles: automation.processing.addSubtitles,
          addMusic: automation.processing.addMusic,
          generateThumbnail: automation.processing.generateThumbnail
        }
      });

      // Generate AI content if needed
      if (automation.ai.generateTitle || automation.ai.generateDescription) {
        await addAIProcessingJob({
          videoId: video._id,
          userId: automation.userId,
          options: automation.ai
        });
      }

      // Update automation stats
      automation.stats.videosProcessed += 1;
      await automation.save();
    }

    // Schedule next run
    if (automation.schedule.isScheduled && automation.status === 'active') {
      scheduleNextRun(automation);
    }
  } catch (error) {
    console.error('Error executing automation:', error);
    automation.status = 'failed';
    await automation.save();
  }
}

// Helper functions
async function createAIVideo(userId, script, automation) {
  const video = new Video({
    userId,
    title: 'AI Generated Video',
    source: 'ai-generated',
    aiContent: { script },
    status: 'pending',
    automationId: automation._id
  });
  await video.save();
  return video;
}

async function setupAutomationSchedule(automation) {
  // Implementation for scheduling with node-cron or similar
  console.log(`Setting up schedule for automation ${automation._id}`);
}

async function scheduleNextRun(automation) {
  // Implementation for scheduling next run
  console.log(`Scheduling next run for automation ${automation._id}`);
}
