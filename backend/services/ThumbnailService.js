const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

class ThumbnailService {
  constructor() {
    this.tempDir = path.join(__dirname, '../../temp/thumbnails');
    this.ensureDir();
  }

  async ensureDir() {
    await fs.mkdir(this.tempDir, { recursive: true });
  }

  // Extract frame from video
  async extractFrame(videoPath, timestamp = 0) {
    try {
      const outputPath = path.join(this.tempDir, `${uuidv4()}_frame.jpg`);
      
      // Use ffmpeg to extract frame
      const { exec } = require('child_process');
      const util = require('util');
      const execPromise = util.promisify(exec);
      
      await execPromise(
        `ffmpeg -i "${videoPath}" -ss ${timestamp} -vframes 1 -q:v 2 "${outputPath}"`
      );
      
      return outputPath;
    } catch (error) {
      console.error('Error extracting frame:', error);
      throw error;
    }
  }

  // Generate thumbnail with text overlay
  async generateThumbnail(imagePath, options = {}) {
    try {
      const {
        text,
        fontSize = 60,
        fontColor = '#FFFFFF',
        backgroundColor = 'rgba(0,0,0,0.6)',
        position = 'center',
        width = 1280,
        height = 720
      } = options;
      
      const outputPath = path.join(this.tempDir, `${uuidv4()}_thumbnail.jpg`);
      
      let image = sharp(imagePath);
      
      // Resize if needed
      const metadata = await image.metadata();
      if (metadata.width !== width || metadata.height !== height) {
        image = image.resize(width, height, { fit: 'cover' });
      }
      
      if (text) {
        // Create text overlay using SVG
        const svg = this.createTextSvg(text, {
          fontSize,
          fontColor,
          backgroundColor,
          position,
          width,
          height
        });
        
        image = image.composite([{
          input: Buffer.from(svg),
          top: 0,
          left: 0
        }]);
      }
      
      await image.toFile(outputPath);
      
      return outputPath;
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      throw error;
    }
  }

  // Create text SVG
  createTextSvg(text, options) {
    const { fontSize, fontColor, backgroundColor, position, width, height } = options;
    
    let yPosition;
    switch (position) {
      case 'top':
        yPosition = fontSize + 20;
        break;
      case 'bottom':
        yPosition = height - fontSize - 20;
        break;
      default:
        yPosition = height / 2;
    }
    
    return `<svg width="${width}" height="${height}">
      <rect width="100%" height="100%" fill="${backgroundColor}"/>
      <text 
        x="50%" 
        y="${yPosition}" 
        font-size="${fontSize}" 
        fill="${fontColor}" 
        text-anchor="middle" 
        font-family="Arial, sans-serif"
        font-weight="bold"
      >${text}</text>
    </svg>`;
  }

  // Generate multiple thumbnail variations
  async generateVariations(imagePath, variations = 5) {
    try {
      const thumbnails = [];
      
      for (let i = 0; i < variations; i++) {
        const options = {
          text: `Thumbnail ${i + 1}`,
          fontSize: 60,
          fontColor: '#FFFFFF',
          backgroundColor: 'rgba(0,0,0,0.6)',
          position: i % 2 === 0 ? 'center' : 'bottom'
        };
        
        const thumbnail = await this.generateThumbnail(imagePath, options);
        thumbnails.push(thumbnail);
      }
      
      return thumbnails;
    } catch (error) {
      console.error('Error generating variations:', error);
      throw error;
    }
  }

  // Generate thumbnail from video scene detection
  async generateFromSceneDetection(videoPath, numScenes = 5) {
    try {
      // This would use scene detection algorithm
      // Placeholder implementation
      const timestamps = [0, 5, 10, 15, 20]; // seconds
      const thumbnails = [];
      
      for (const timestamp of timestamps.slice(0, numScenes)) {
        const frame = await this.extractFrame(videoPath, timestamp);
        const thumbnail = await this.generateThumbnail(frame);
        thumbnails.push(thumbnail);
      }
      
      return thumbnails;
    } catch (error) {
      console.error('Error generating from scene detection:', error);
      throw error;
    }
  }

  // Add gradient overlay
  async addGradientOverlay(thumbnailPath, gradient = 'linear-gradient(0deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)') {
    try {
      const outputPath = path.join(this.tempDir, `${uuidv4()}_gradient.jpg`);
      
      // Create gradient SVG
      const svg = `<svg width="1280" height="720">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="rgba(0,0,0,0)"/>
            <stop offset="100%" stop-color="rgba(0,0,0,0.8)"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)"/>
      </svg>`;
      
      await sharp(thumbnailPath)
        .composite([{
          input: Buffer.from(svg),
          blend: 'overlay'
        }])
        .toFile(outputPath);
      
      return outputPath;
    } catch (error) {
      console.error('Error adding gradient overlay:', error);
      throw error;
    }
  }

  // Apply filter to thumbnail
  async applyFilter(thumbnailPath, filter = 'vibrant') {
    try {
      const outputPath = path.join(this.tempDir, `${uuidv4()}_filtered.jpg`);
      
      let sharpInstance = sharp(thumbnailPath);
      
      switch (filter) {
        case 'vibrant':
          sharpInstance = sharpInstance.modulate({ saturation: 1.5 });
          break;
        case 'sepia':
          sharpInstance = sharpInstance.tint({ r: 112, g: 66, b: 20 });
          break;
        case 'black-white':
          sharpInstance = sharpInstance.grayscale();
          break;
        case 'warm':
          sharpInstance = sharpInstance.modulate({ brightness: 1.1, saturation: 1.2 });
          break;
        case 'cool':
          sharpInstance = sharpInstance.modulate({ brightness: 0.9, saturation: 0.8 });
          break;
      }
      
      await sharpInstance.toFile(outputPath);
      
      return outputPath;
    } catch (error) {
      console.error('Error applying filter:', error);
      throw error;
    }
  }

  // Clean up
  async cleanup(thumbnailPaths) {
    for (const path of thumbnailPaths) {
      try {
        await fs.unlink(path);
      } catch (error) {
        console.error(`Error deleting thumbnail ${path}:`, error);
      }
    }
  }
}

module.exports = new ThumbnailService();
