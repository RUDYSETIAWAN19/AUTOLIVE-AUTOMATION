const mongoose = require('mongoose');
const crypto = require('crypto');

const apiKeySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  key: {
    type: String,
    required: true,
    unique: true,
    default: () => crypto.randomBytes(32).toString('hex')
  },
  platform: {
    type: String,
    enum: ['openai', 'youtube', 'tiktok', 'facebook', 'instagram', 'stability'],
    required: true
  },
  permissions: [{
    type: String,
    enum: ['read', 'write', 'delete', 'admin']
  }],
  lastUsed: Date,
  expiresAt: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  usageLimit: Number,
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

apiKeySchema.index({ userId: 1, platform: 1 });
apiKeySchema.index({ key: 1 }, { unique: true });

apiKeySchema.methods.incrementUsage = async function() {
  this.usageCount += 1;
  this.lastUsed = new Date();
  await this.save();
};

apiKeySchema.methods.isValid = function() {
  if (!this.isActive) return false;
  if (this.expiresAt && this.expiresAt < new Date()) return false;
  if (this.usageLimit && this.usageCount >= this.usageLimit) return false;
  return true;
};

module.exports = mongoose.model('ApiKey', apiKeySchema);
