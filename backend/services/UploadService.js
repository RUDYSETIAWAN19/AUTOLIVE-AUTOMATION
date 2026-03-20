const { google } = require('googleapis');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class UploadService {
  constructor() {
    this.youtube = google.youtube('v3');
  }

  // Upload to YouTube
  async uploadToYouTube(videoPath, metadata, accessToken) {
    try {
      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: accessToken });

      const response = await this.youtube.videos.insert({
        auth,
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title: metadata.title,
            description: metadata.description,
            tags: metadata.tags,
            categoryId: metadata.categoryId || '22',
            defaultLanguage: metadata.language || 'en'
          },
          status: {
            privacyStatus: metadata.privacyStatus || 'public',
            publishAt: metadata.publishAt,
            selfDeclaredMadeForKids: false
          }
        },
        media: {
          body: fs.createReadStream(videoPath)
        }
      });

      // Upload thumbnail if provided
      if (metadata.thumbnailPath) {
        await this.uploadYouTubeThumbnail(
          response.data.id,
          metadata.thumbnailPath,
          accessToken
        );
      }

      return {
        success: true,
        videoId: response.data.id,
        url: `https://youtu.be/${response.data.id}`,
        data: response.data
      };
    } catch (error) {
      console.error('YouTube upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Upload YouTube thumbnail
  async uploadYouTubeThumbnail(videoId, thumbnailPath, accessToken) {
    try {
      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: accessToken });

      const response = await this.youtube.thumbnails.set({
        auth,
        videoId,
        media: {
          body: fs.createReadStream(thumbnailPath)
        }
      });

      return response.data;
    } catch (error) {
      console.error('YouTube thumbnail upload error:', error);
      throw error;
    }
  }

  // Upload to TikTok (using unofficial API for now)
  async uploadToTikTok(videoPath, metadata, accessToken) {
    try {
      // TikTok API integration
      // This is a placeholder - TikTok's official API has restrictions
      const formData = new FormData();
      formData.append('video', fs.createReadStream(videoPath));
      formData.append('description', metadata.description);
      formData.append('privacy_level', metadata.privacyLevel || 'public');

      const response = await axios.post(
        'https://open-api.tiktok.com/share/video/upload/',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return {
        success: true,
        videoId: response.data.data.video_id,
        url: response.data.data.share_url,
        data: response.data
      };
    } catch (error) {
      console.error('TikTok upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Upload to Instagram
  async uploadToInstagram(videoPath, metadata, accessToken, accountId) {
    try {
      // First, create media container
      const createResponse = await axios.post(
        `https://graph.facebook.com/v12.0/${accountId}/media`,
        {
          media_type: 'VIDEO',
          video_url: await this.getPublicUrl(videoPath),
          caption: metadata.description,
          access_token: accessToken
        }
      );

      const containerId = createResponse.data.id;

      // Wait a bit for processing
      await this.sleep(5000);

      // Publish the media
      const publishResponse = await axios.post(
        `https://graph.facebook.com/v12.0/${accountId}/media_publish`,
        {
          creation_id: containerId,
          access_token: accessToken
        }
      );

      return {
        success: true,
        mediaId: publishResponse.data.id,
        url: `https://www.instagram.com/p/${publishResponse.data.id}/`,
        data: publishResponse.data
      };
    } catch (error) {
      console.error('Instagram upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Upload to Facebook
  async uploadToFacebook(videoPath, metadata, accessToken, pageId) {
    try {
      const formData = new FormData();
      formData.append('source', fs.createReadStream(videoPath));
      formData.append('description', metadata.description);
      formData.append('title', metadata.title);
      formData.append('access_token', accessToken);

      const response = await axios.post(
        `https://graph.facebook.com/v12.0/${pageId}/videos`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return {
        success: true,
        videoId: response.data.id,
        url: `https://www.facebook.com/watch/?v=${response.data.id}`,
        data: response.data
      };
    } catch (error) {
      console.error('Facebook upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get public URL for video (temporary)
  async getPublicUrl(videoPath) {
    // In production, upload to cloud storage and return public URL
    // For now, return a placeholder
    return `https://example.com/videos/${path.basename(videoPath)}`;
  }

  // Validate video before upload
  async validateVideo(videoPath, platform) {
    const stats = await fs.promises.stat(videoPath);
    const maxSizes = {
      youtube: 128 * 1024 * 1024 * 1024, // 128GB
      tiktok: 500 * 1024 * 1024, // 500MB
      instagram: 100 * 1024 * 1024, // 100MB
      facebook: 10 * 1024 * 1024 * 1024 // 10GB
    };

    if (stats.size > maxSizes[platform]) {
      throw new Error(`Video too large for ${platform}. Max size: ${maxSizes[platform] / (1024 * 1024)}MB`);
    }

    return true;
  }

  // Retry upload with exponential backoff
  async retryUpload(uploadFn, maxRetries = 3) {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        const result = await uploadFn();
        if (result.success) return result;
        lastError = result.error;
      } catch (error) {
        lastError = error.message;
      }
      
      if (i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000;
        await this.sleep(delay);
      }
    }
    
    return {
      success: false,
      error: `Upload failed after ${maxRetries} attempts: ${lastError}`
    };
  }

  // Schedule upload
  async scheduleUpload(videoPath, metadata, platform, account, scheduledTime) {
    // Store in database for scheduled upload
    const scheduledUpload = {
      videoPath,
      metadata,
      platform,
      account,
      scheduledTime,
      status: 'scheduled'
    };
    
    // Save to database
    // This would be implemented with a scheduled job
    
    return scheduledUpload;
  }

  // Monitor upload progress
  async monitorUpload(uploadId) {
    // Implementation for progress monitoring
    // This would use WebSocket to send progress updates
    return {
      uploadId,
      progress: 0,
      status: 'uploading'
    };
  }

  // Helper: Sleep
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new UploadService();
