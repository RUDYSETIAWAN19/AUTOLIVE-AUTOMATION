const Video = require('../models/Video');
const Job = require('../models/Job');
const Automation = require('../models/Automation');
const { addVideoProcessingJob } = require('../jobs/queue');
const AIService = require('../services/AIService');
const VideoProcessor = require('../services/VideoProcessor');
const fs = require('fs').promises;
const path = require('path');

// Create video
exports.createVideo = async (req, res, next) => {
  try {
    const videoData = {
      ...req.body,
      userId: req.user.id,
      status: 'pending'
    };

    const video = new Video(videoData);
    await video.save();

    // Add to processing queue
    await addVideoProcessingJob({
      videoId: video._id,
      userId: req.user.id,
      type: 'process'
    });

    res.status(201).json({
      message: 'Video created successfully',
      video
    });
  } catch (error) {
    next(error);
  }
};

// Get all videos
exports.getVideos = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const source = req.query.source;

    const query = { userId: req.user.id };
    if (status) query.status = status;
    if (source) query.source = source;

    const videos = await Video.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Video.countDocuments(query);

    res.json({
      videos,
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

// Get video by ID
exports.getVideoById = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    if (video.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(video);
  } catch (error) {
    next(error);
  }
};

// Update video
exports.updateVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    if (video.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updates = {
      title: req.body.title,
      description: req.body.description,
      seo: req.body.seo,
      updatedAt: Date.now()
    };

    Object.keys(updates).forEach(key => 
      updates[key] === undefined && delete updates[key]
    );

    const updatedVideo = await Video.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Video updated successfully',
      video: updatedVideo
    });
  } catch (error) {
    next(error);
  }
};

// Delete video
exports.deleteVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    if (video.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete files
    const filesToDelete = [
      video.files.original,
      video.files.processed,
      video.files.thumbnail,
      video.files.subtitle,
      video.files.audio
    ].filter(f => f);

    for (const file of filesToDelete) {
      try {
        await fs.unlink(file);
      } catch (err) {
        console.error(`Error deleting file ${file}:`, err);
      }
    }

    await video.deleteOne();

    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Process video
exports.processVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    if (video.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await addVideoProcessingJob({
      videoId: video._id,
      userId: req.user.id,
      type: 'process',
      options: req.body
    });

    res.json({ message: 'Video processing started' });
  } catch (error) {
    next(error);
  }
};

// Generate AI content for video
exports.generateAIContent = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const { topic } = req.body;

    // Generate script
    const script = await AIService.generateScript(topic);
    
    // Generate title
    const titles = await AIService.generateTitle(script);
    
    // Generate description
    const description = await AIService.generateDescription(script, titles[0]);
    
    // Generate hashtags
    const hashtags = await AIService.generateHashtags(topic, titles[0]);

    video.aiContent = {
      script,
      ...video.aiContent
    };
    
    video.seo = {
      title: titles[0],
      description,
      tags: hashtags,
      ...video.seo
    };

    await video.save();

    res.json({
      message: 'AI content generated',
      aiContent: video.aiContent,
      seo: video.seo,
      alternativeTitles: titles.slice(1)
    });
  } catch (error) {
    next(error);
  }
};

// Generate thumbnail
exports.generateThumbnail = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    if (!video.files.processed) {
      return res.status(400).json({ message: 'Video not processed yet' });
    }

    const thumbnailPath = await VideoProcessor.generateThumbnail(
      video.files.processed,
      req.body.timestamp || '00:00:01'
    );

    video.thumbnails.push({
      url: thumbnailPath,
      text: req.body.text || '',
      selected: video.thumbnails.length === 0
    });

    await video.save();

    res.json({
      message: 'Thumbnail generated',
      thumbnail: video.thumbnails[video.thumbnails.length - 1]
    });
  } catch (error) {
    next(error);
  }
};

// Add subtitle
exports.addSubtitle = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const { language, content } = req.body;

    video.subtitles.push({
      language,
      content,
      url: null // Will be generated by service
    });

    await video.save();

    res.json({
      message: 'Subtitle added',
      subtitle: video.subtitles[video.subtitles.length - 1]
    });
  } catch (error) {
    next(error);
  }
};

// Get video analytics
exports.getVideoAnalytics = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    if (video.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const analytics = await Analytics.find({ videoId: video._id })
      .sort({ date: -1 })
      .limit(30);

    res.json({
      video: {
        title: video.title,
        source: video.source,
        status: video.status,
        createdAt: video.createdAt
      },
      analytics,
      summary: {
        totalViews: video.analytics.views,
        totalLikes: video.analytics.likes,
        totalComments: video.analytics.comments,
        totalShares: video.analytics.shares
      }
    });
  } catch (error) {
    next(error);
  }
};
