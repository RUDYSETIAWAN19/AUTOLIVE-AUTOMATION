const axios = require('axios');
const ytdl = require('ytdl-core');
const { exec } = require('child_process');
const util = require('util');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const execPromise = util.promisify(exec);

class ScraperService {
  constructor() {
    this.tempDir = path.join(__dirname, '../../temp/downloads');
    this.ensureDir();
  }

  async ensureDir() {
    await fs.mkdir(this.tempDir, { recursive: true });
  }

  // Scrape videos from YouTube
  async scrapeYouTube(options) {
    try {
      const { keywords, maxResults = 10, minDuration, maxDuration } = options;
      const videos = [];

      // Using YouTube Data API v3
      const apiKey = process.env.YOUTUBE_API_KEY;
      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          q: keywords.join(' '),
          maxResults: maxResults,
          type: 'video',
          key: apiKey,
          videoDuration: this.getDurationFilter(minDuration, maxDuration)
        }
      });

      // Get video details
      const videoIds = response.data.items.map(item => item.id.videoId);
      const detailsResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
          part: 'contentDetails,statistics',
          id: videoIds.join(','),
          key: apiKey
        }
      });

      for (const item of response.data.items) {
        const details = detailsResponse.data.items.find(
          d => d.id === item.id.videoId
        );

        if (details) {
          const duration = this.parseDuration(details.contentDetails.duration);
          
          videos.push({
            platform: 'youtube',
            id: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.high.url,
            url: `https://youtu.be/${item.id.videoId}`,
            duration: duration,
            views: parseInt(details.statistics.viewCount) || 0,
            likes: parseInt(details.statistics.likeCount) || 0,
            viralScore: this.calculateViralScore(
              parseInt(details.statistics.viewCount) || 0,
              parseInt(details.statistics.likeCount) || 0,
              duration
            ),
            publishedAt: item.snippet.publishedAt
          });
        }
      }

      return videos;
    } catch (error) {
      console.error('YouTube scraping error:', error);
      throw error;
    }
  }

  // Scrape from TikTok (using unofficial methods)
  async scrapeTikTok(options) {
    try {
      const { keywords, maxResults = 10 } = options;
      const videos = [];

      // This would use TikTok's unofficial API
      // Placeholder implementation
      const response = await axios.get('https://www.tiktok.com/api/search', {
        params: {
          keyword: keywords.join(' '),
          count: maxResults
        }
      });

      // Parse response
      for (const item of response.data.items) {
        videos.push({
          platform: 'tiktok',
          id: item.id,
          title: item.desc,
          description: item.desc,
          thumbnail: item.video.cover,
          url: `https://www.tiktok.com/@${item.author.uniqueId}/video/${item.id}`,
          duration: item.video.duration,
          views: item.stats.playCount,
          likes: item.stats.diggCount,
          viralScore: this.calculateViralScore(
            item.stats.playCount,
            item.stats.diggCount,
            item.video.duration
          ),
          publishedAt: item.createTime
        });
      }

      return videos;
    } catch (error) {
      console.error('TikTok scraping error:', error);
      throw error;
    }
  }

  // Download video from platform
  async downloadVideo(url, platform) {
    try {
      const outputPath = path.join(this.tempDir, `${uuidv4()}.mp4`);

      switch (platform) {
        case 'youtube':
          await this.downloadYouTube(url, outputPath);
          break;
        case 'tiktok':
          await this.downloadTikTok(url, outputPath);
          break;
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }

      return {
        path: outputPath,
        platform,
        url
      };
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  }

  // Download YouTube video
  async downloadYouTube(url, outputPath) {
    try {
      const stream = ytdl(url, { quality: 'highest' });
      const writeStream = fs.createWriteStream(outputPath);
      
      return new Promise((resolve, reject) => {
        stream.pipe(writeStream);
        
        writeStream.on('finish', () => {
          resolve(outputPath);
        });
        
        writeStream.on('error', reject);
        stream.on('error', reject);
      });
    } catch (error) {
      console.error('YouTube download error:', error);
      throw error;
    }
  }

  // Download TikTok video using yt-dlp
  async downloadTikTok(url, outputPath) {
    try {
      await execPromise(`yt-dlp -f "best[height<=1080]" -o "${outputPath}" "${url}"`);
      return outputPath;
    } catch (error) {
      console.error('TikTok download error:', error);
      throw error;
    }
  }

  // Get viral score
  calculateViralScore(views, likes, duration) {
    const engagementRate = (likes / views) * 100;
    const durationScore = Math.min(duration / 60, 100);
    
    return Math.round(
      (engagementRate * 0.7) + (durationScore * 0.3)
    );
  }

  // Parse ISO 8601 duration to seconds
  parseDuration(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = (match[1] ? parseInt(match[1]) : 0);
    const minutes = (match[2] ? parseInt(match[2]) : 0);
    const seconds = (match[3] ? parseInt(match[3]) : 0);
    
    return hours * 3600 + minutes * 60 + seconds;
  }

  // Get duration filter for API
  getDurationFilter(minDuration, maxDuration) {
    if (minDuration < 60) return 'short';
    if (maxDuration > 600) return 'long';
    return 'medium';
  }

  // Get video metadata
  async getVideoMetadata(url, platform) {
    try {
      switch (platform) {
        case 'youtube':
          const info = await ytdl.getInfo(url);
          return {
            title: info.videoDetails.title,
            duration: parseInt(info.videoDetails.lengthSeconds),
            views: parseInt(info.videoDetails.viewCount),
            likes: parseInt(info.videoDetails.likes),
            thumbnail: info.videoDetails.thumbnails[0].url
          };
        default:
          throw new Error(`Metadata extraction not supported for ${platform}`);
      }
    } catch (error) {
      console.error('Metadata extraction error:', error);
      throw error;
    }
  }

  // Clean up downloaded files
  async cleanup(files) {
    for (const file of files) {
      try {
        await fs.unlink(file);
      } catch (error) {
        console.error(`Error deleting file ${file}:`, error);
      }
    }
  }
}

module.exports = new ScraperService();
