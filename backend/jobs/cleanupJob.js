const { cleanupQueue } = require('./queue');
const fs = require('fs').promises;
const path = require('path');
const Video = require('../models/Video');
const logger = require('../utils/logger');

// Directories to clean
const TEMP_DIR = path.join(__dirname, '../../temp');
const UPLOADS_DIR = path.join(__dirname, '../../uploads');
const DOWNLOADS_DIR = path.join(TEMP_DIR, 'downloads');
const PROCESSED_DIR = path.join(UPLOADS_DIR, 'processed');
const THUMBNAILS_DIR = path.join(TEMP_DIR, 'thumbnails');
const SUBTITLES_DIR = path.join(TEMP_DIR, 'subtitles');

// Cleanup intervals (in milliseconds)
const CLEANUP_INTERVALS = {
  TEMP: 24 * 60 * 60 * 1000, // 24 hours
  DOWNLOADS: 12 * 60 * 60 * 1000, // 12 hours
  PROCESSED: 48 * 60 * 60 * 1000, // 48 hours
  THUMBNAILS: 24 * 60 * 60 * 1000, // 24 hours
  SUBTITLES: 24 * 60 * 60 * 1000, // 24 hours
};

// Cleanup job processor
cleanupQueue.process(async (job) => {
  const { type, olderThan } = job.data;
  
  logger.info(`Running cleanup job: ${type}`);
  
  try {
    let cleanedFiles = 0;
    let cleanedSize = 0;
    
    switch (type) {
      case 'temp':
        cleanedFiles = await cleanDirectory(TEMP_DIR, olderThan || CLEANUP_INTERVALS.TEMP);
        break;
      case 'downloads':
        cleanedFiles = await cleanDirectory(DOWNLOADS_DIR, olderThan || CLEANUP_INTERVALS.DOWNLOADS);
        break;
      case 'processed':
        cleanedFiles = await cleanProcessedVideos(olderThan || CLEANUP_INTERVALS.PROCESSED);
        break;
      case 'thumbnails':
        cleanedFiles = await cleanDirectory(THUMBNAILS_DIR, olderThan || CLEANUP_INTERVALS.THUMBNAILS);
        break;
      case 'subtitles':
        cleanedFiles = await cleanDirectory(SUBTITLES_DIR, olderThan || CLEANUP_INTERVALS.SUBTITLES);
        break;
      case 'all':
        cleanedFiles = await cleanAll();
        break;
      default:
        throw new Error(`Unknown cleanup type: ${type}`);
    }
    
    logger.info(`Cleanup completed: ${cleanedFiles} files removed`);
    
    return {
      success: true,
      type,
      cleanedFiles,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error(`Cleanup job failed: ${type}`, error);
    throw error;
  }
});

// Clean directory by age
async function cleanDirectory(directory, age) {
  try {
    // Check if directory exists
    await fs.access(directory);
  } catch {
    logger.warn(`Directory does not exist: ${directory}`);
    return 0;
  }
  
  const now = Date.now();
  let cleanedCount = 0;
  
  try {
    const files = await fs.readdir(directory);
    
    for (const file of files) {
      const filePath = path.join(directory, file);
      const stats = await fs.stat(filePath);
      
      if (stats.isDirectory()) {
        // Recursively clean subdirectories
        cleanedCount += await cleanDirectory(filePath, age);
        // Remove empty directory
        const remaining = await fs.readdir(filePath);
        if (remaining.length === 0) {
          await fs.rmdir(filePath);
        }
      } else {
        const fileAge = now - stats.mtimeMs;
        
        if (fileAge > age) {
          await fs.unlink(filePath);
          cleanedCount++;
          logger.debug(`Deleted old file: ${filePath} (age: ${Math.round(fileAge / 3600000)} hours)`);
        }
      }
    }
  } catch (error) {
    logger.error(`Error cleaning directory ${directory}:`, error);
  }
  
  return cleanedCount;
}

// Clean processed videos that are no longer referenced
async function cleanProcessedVideos(age) {
  const now = Date.now();
  let cleanedCount = 0;
  
  try {
    // Get all processed video files
    const files = await fs.readdir(PROCESSED_DIR);
    
    for (const file of files) {
      const filePath = path.join(PROCESSED_DIR, file);
      const stats = await fs.stat(filePath);
      const fileAge = now - stats.mtimeMs;
      
      if (fileAge > age) {
        // Check if video is still referenced in database
        const video = await Video.findOne({ 'files.processed': filePath });
        
        if (!video) {
          await fs.unlink(filePath);
          cleanedCount++;
          logger.debug(`Deleted orphaned processed video: ${filePath}`);
        }
      }
    }
  } catch (error) {
    logger.error('Error cleaning processed videos:', error);
  }
  
  return cleanedCount;
}

// Clean all temporary files
async function cleanAll() {
  let totalCleaned = 0;
  
  const cleanupTypes = ['temp', 'downloads', 'processed', 'thumbnails', 'subtitles'];
  
  for (const type of cleanupTypes) {
    const result = await cleanupQueue.add(
      { type },
      { removeOnComplete: true }
    );
    const jobResult = await result.finished();
    totalCleaned += jobResult.cleanedFiles;
  }
  
  return totalCleaned;
}

// Schedule recurring cleanup jobs
const scheduleCleanupJobs = async () => {
  // Daily cleanup of all temp files
  await cleanupQueue.add(
    { type: 'all' },
    {
      repeat: {
        cron: '0 2 * * *', // Run at 2 AM daily
      },
      removeOnComplete: true,
    }
  );
  
  // Hourly cleanup of downloads (more frequent)
  await cleanupQueue.add(
    { type: 'downloads' },
    {
      repeat: {
        cron: '0 * * * *', // Run hourly
      },
      removeOnComplete: true,
    }
  );
  
  logger.info('Scheduled cleanup jobs configured');
};

// Calculate disk usage
const getDiskUsage = async () => {
  const usage = {};
  
  const directories = {
    temp: TEMP_DIR,
    downloads: DOWNLOADS_DIR,
    processed: PROCESSED_DIR,
    thumbnails: THUMBNAILS_DIR,
    subtitles: SUBTITLES_DIR,
  };
  
  for (const [name, dir] of Object.entries(directories)) {
    try {
      await fs.access(dir);
      const files = await fs.readdir(dir);
      let totalSize = 0;
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = await fs.stat(filePath);
        totalSize += stats.size;
      }
      
      usage[name] = {
        size: totalSize,
        files: files.length,
        sizeFormatted: formatBytes(totalSize),
      };
    } catch {
      usage[name] = {
        size: 0,
        files: 0,
        sizeFormatted: '0 B',
      };
    }
  }
  
  return usage;
};

// Helper: Format bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

module.exports = {
  cleanupQueue,
  scheduleCleanupJobs,
  getDiskUsage,
  cleanDirectory,
};
