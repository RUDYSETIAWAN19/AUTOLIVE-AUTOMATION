const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

const helpers = {
  // Generate random string
  generateRandomString: (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
  },

  // Generate unique filename
  generateFilename: (originalname) => {
    const ext = path.extname(originalname);
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    return `${timestamp}-${random}${ext}`;
  },

  // Format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Extract video ID from URL
  extractVideoId: (url, platform) => {
    const patterns = {
      youtube: /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
      tiktok: /tiktok\.com\/@[\w.-]+\/video\/(\d+)/,
      instagram: /instagram\.com\/(?:p|reel)\/([^\/?#&]+)/
    };
    
    const match = url.match(patterns[platform]);
    return match ? match[1] : null;
  },

  // Calculate viral score
  calculateViralScore: (views, likes, comments, shares, duration) => {
    const viewWeight = 0.3;
    const likeWeight = 0.2;
    const commentWeight = 0.2;
    const shareWeight = 0.2;
    const durationWeight = 0.1;

    const viewScore = Math.min(views / 10000, 100);
    const likeScore = Math.min((likes / views) * 100, 100);
    const commentScore = Math.min((comments / views) * 100, 100);
    const shareScore = Math.min((shares / views) * 100, 100);
    const durationScore = Math.min((duration / 60) * 100, 100);

    return Math.round(
      viewScore * viewWeight +
      likeScore * likeWeight +
      commentScore * commentWeight +
      shareScore * shareWeight +
      durationScore * durationWeight
    );
  },

  // Clean old files
  cleanOldFiles: async (directory, hours = 24) => {
    try {
      const files = await fs.readdir(directory);
      const now = Date.now();
      const maxAge = hours * 60 * 60 * 1000;

      for (const file of files) {
        const filePath = path.join(directory, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtimeMs > maxAge) {
          await fs.unlink(filePath);
          console.log(`Deleted old file: ${file}`);
        }
      }
    } catch (error) {
      console.error('Error cleaning old files:', error);
    }
  },

  // Retry function with exponential backoff
  retry: async (fn, maxAttempts = 3, baseDelay = 1000) => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxAttempts) throw error;
        
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  },

  // Paginate array
  paginate: (array, page = 1, limit = 10) => {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    return {
      data: array.slice(startIndex, endIndex),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(array.length / limit),
        totalItems: array.length,
        itemsPerPage: limit
      }
    };
  },

  // Sanitize filename
  sanitizeFilename: (filename) => {
    return filename
      .replace(/[^a-z0-9.]/gi, '_')
      .toLowerCase();
  },

  // Parse time string to seconds
  parseTimeToSeconds: (timeStr) => {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    return parts[0] || 0;
  },

  // Format seconds to time string
  formatSecondsToTime: (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
};

module.exports = helpers;
