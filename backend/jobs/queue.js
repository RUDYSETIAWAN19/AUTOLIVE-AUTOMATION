const Bull = require('bull');
const Redis = require('ioredis');

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD
};

const connection = new Redis(redisConfig);

// Create queues
const videoQueue = new Bull('video-processing', { redis: redisConfig });
const uploadQueue = new Bull('video-upload', { redis: redisConfig });
const cleanupQueue = new Bull('cleanup', { redis: redisConfig });
const aiQueue = new Bull('ai-processing', { redis: redisConfig });

// Queue event handlers
videoQueue.on('completed', (job) => {
  console.log(`Video processing job ${job.id} completed`);
});

videoQueue.on('failed', (job, err) => {
  console.error(`Video processing job ${job.id} failed:`, err);
});

uploadQueue.on('completed', (job) => {
  console.log(`Upload job ${job.id} completed`);
});

uploadQueue.on('failed', (job, err) => {
  console.error(`Upload job ${job.id} failed:`, err);
});

// Add video processing job
const addVideoProcessingJob = async (data) => {
  return await videoQueue.add(data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 60000 // 1 minute
    },
    removeOnComplete: true,
    removeOnFail: false
  });
};

// Add upload job
const addUploadJob = async (data) => {
  return await uploadQueue.add(data, {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 300000 // 5 minutes
    },
    removeOnComplete: true,
    removeOnFail: false
  });
};

// Add cleanup job
const addCleanupJob = async (data) => {
  return await cleanupQueue.add(data, {
    delay: 24 * 60 * 60 * 1000, // 24 hours
    attempts: 3,
    removeOnComplete: true
  });
};

// Add AI processing job
const addAIProcessingJob = async (data) => {
  return await aiQueue.add(data, {
    attempts: 2,
    backoff: 10000,
    removeOnComplete: true
  });
};

// Get queue status
const getQueueStatus = async () => {
  return {
    video: await videoQueue.getJobCounts(),
    upload: await uploadQueue.getJobCounts(),
    cleanup: await cleanupQueue.getJobCounts(),
    ai: await aiQueue.getJobCounts()
  };
};

// Clean old jobs
const cleanOldJobs = async () => {
  await videoQueue.clean(24 * 60 * 60 * 1000, 'completed');
  await videoQueue.clean(24 * 60 * 60 * 1000, 'failed');
  await uploadQueue.clean(24 * 60 * 60 * 1000, 'completed');
  await uploadQueue.clean(24 * 60 * 60 * 1000, 'failed');
};

module.exports = {
  videoQueue,
  uploadQueue,
  cleanupQueue,
  aiQueue,
  addVideoProcessingJob,
  addUploadJob,
  addCleanupJob,
  addAIProcessingJob,
  getQueueStatus,
  cleanOldJobs
};
