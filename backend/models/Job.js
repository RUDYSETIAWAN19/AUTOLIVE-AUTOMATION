const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['video_processing', 'upload', 'download', 'ai_generation', 'cleanup', 'automation'],
    required: true
  },
  status: {
    type: String,
    enum: ['queued', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'queued'
  },
  priority: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  result: mongoose.Schema.Types.Mixed,
  error: {
    message: String,
    stack: String,
    code: String
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  attempts: {
    type: Number,
    default: 0
  },
  maxAttempts: {
    type: Number,
    default: 3
  },
  queueName: String,
  bullJobId: String,
  startedAt: Date,
  completedAt: Date,
  failedAt: Date,
  scheduledFor: Date,
  tags: [String],
  metadata: {
    type: Map,
    of: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

jobSchema.index({ userId: 1, status: 1 });
jobSchema.index({ type: 1, status: 1 });
jobSchema.index({ scheduledFor: 1 });
jobSchema.index({ createdAt: -1 });

jobSchema.methods.updateProgress = function(progress) {
  this.progress = progress;
  this.updatedAt = new Date();
  return this.save();
};

jobSchema.methods.complete = function(result) {
  this.status = 'completed';
  this.result = result;
  this.progress = 100;
  this.completedAt = new Date();
  this.updatedAt = new Date();
  return this.save();
};

jobSchema.methods.fail = function(error) {
  this.status = 'failed';
  this.error = {
    message: error.message,
    stack: error.stack,
    code: error.code
  };
  this.failedAt = new Date();
  this.updatedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Job', jobSchema);
