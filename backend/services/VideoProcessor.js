const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

class VideoProcessor {
  constructor() {
    this.tempDir = path.join(__dirname, '../../temp');
    this.outputDir = path.join(__dirname, '../../uploads/processed');
  }

  // Ensure directories exist
  async ensureDirs() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
      await fs.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      console.error('Error creating directories:', error);
    }
  }

  // Crop video to 9:16 vertical format
  async cropToVertical(inputPath, outputPath = null) {
    return new Promise(async (resolve, reject) => {
      await this.ensureDirs();
      
      if (!outputPath) {
        outputPath = path.join(this.outputDir, `${uuidv4()}_vertical.mp4`);
      }

      ffmpeg(inputPath)
        .size('1080x1920')
        .aspect('9:16')
        .autopad()
        .videoCodec('libx264')
        .audioCodec('aac')
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(err))
        .save(outputPath);
    });
  }

  // Trim video to specific duration
  async trimVideo(inputPath, startTime, duration, outputPath = null) {
    return new Promise(async (resolve, reject) => {
      await this.ensureDirs();

      if (!outputPath) {
        outputPath = path.join(this.outputDir, `${uuidv4()}_trimmed.mp4`);
      }

      ffmpeg(inputPath)
        .setStartTime(startTime)
        .setDuration(duration)
        .videoCodec('libx264')
        .audioCodec('aac')
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(err))
        .save(outputPath);
    });
  }

  // Add subtitles to video
  async addSubtitles(inputPath, subtitlePath, outputPath = null) {
    return new Promise(async (resolve, reject) => {
      await this.ensureDirs();

      if (!outputPath) {
        outputPath = path.join(this.outputDir, `${uuidv4()}_subtitled.mp4`);
      }

      ffmpeg(inputPath)
        .videoFilters(`subtitles=${subtitlePath}`)
        .videoCodec('libx264')
        .audioCodec('aac')
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(err))
        .save(outputPath);
    });
  }

  // Add background music
  async addMusic(inputPath, musicPath, volume = 0.3, outputPath = null) {
    return new Promise(async (resolve, reject) => {
      await this.ensureDirs();

      if (!outputPath) {
        outputPath = path.join(this.outputDir, `${uuidv4()}_with_music.mp4`);
      }

      ffmpeg()
        .input(inputPath)
        .input(musicPath)
        .complexFilter([
          {
            filter: 'amix',
            options: { inputs: 2, duration: 'shortest' }
          }
        ])
        .outputOptions('-map 0:v')
        .outputOptions('-map 0:a?')
        .outputOptions('-map 1:a?')
        .videoCodec('libx264')
        .audioCodec('aac')
        .audioBitrate(128)
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(err))
        .save(outputPath);
    });
  }

  // Generate thumbnail from video
  async generateThumbnail(inputPath, time = '00:00:01', outputPath = null) {
    return new Promise(async (resolve, reject) => {
      await this.ensureDirs();

      if (!outputPath) {
        outputPath = path.join(this.outputDir, `${uuidv4()}_thumbnail.jpg`);
      }

      ffmpeg(inputPath)
        .screenshots({
          timestamps: [time],
          filename: path.basename(outputPath),
          folder: path.dirname(outputPath),
          size: '1280x720'
        })
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(err));
    });
  }

  // Combine multiple videos
  async combineVideos(videoPaths, outputPath = null) {
    return new Promise(async (resolve, reject) => {
      await this.ensureDirs();

      if (!outputPath) {
        outputPath = path.join(this.outputDir, `${uuidv4()}_combined.mp4`);
      }

      // Create concat file
      const concatFile = path.join(this.tempDir, `${uuidv4()}.txt`);
      const fileList = videoPaths.map(p => `file '${p}'`).join('\n');
      await fs.writeFile(concatFile, fileList);

      ffmpeg()
        .input(concatFile)
        .inputOptions(['-f concat', '-safe 0'])
        .videoCodec('libx264')
        .audioCodec('aac')
        .on('end', async () => {
          await fs.unlink(concatFile);
          resolve(outputPath);
        })
        .on('error', async (err) => {
          await fs.unlink(concatFile);
          reject(err);
        })
        .save(outputPath);
    });
  }

  // Extract audio from video
  async extractAudio(inputPath, outputPath = null) {
    return new Promise(async (resolve, reject) => {
      await this.ensureDirs();

      if (!outputPath) {
        outputPath = path.join(this.outputDir, `${uuidv4()}.mp3`);
      }

      ffmpeg(inputPath)
        .toFormat('mp3')
        .audioBitrate(128)
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(err))
        .save(outputPath);
    });
  }

  // Get video metadata
  async getMetadata(inputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (err, metadata) => {
        if (err) reject(err);
        else resolve(metadata);
      });
    });
  }

  // Clean up temporary files
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

module.exports = new VideoProcessor();
