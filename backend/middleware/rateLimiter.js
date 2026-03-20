const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD
});

// General API rate limiter
const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:api:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

// Auth endpoints rate limiter (stricter)
const authLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:auth:'
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 login attempts per hour
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

// Upload endpoints rate limiter
const uploadLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:upload:'
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 uploads per hour
  message: 'Upload limit reached, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

// Video processing rate limiter
const videoLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:video:'
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 video processes per hour
  message: 'Video processing limit reached, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

// Custom rate limiter for different user plans
const planBasedLimiter = (req, res, next) => {
  const userPlan = req.user?.plan || 'free';
  
  const limits = {
    free: { windowMs: 60 * 60 * 1000, max: 10 },
    pro: { windowMs: 60 * 60 * 1000, max: 50 },
    premium: { windowMs: 60 * 60 * 1000, max: 200 }
  };

  const limiter = rateLimit({
    store: new RedisStore({
      client: redisClient,
      prefix: `rl:${userPlan}:${req.user?.id}:`
    }),
    windowMs: limits[userPlan].windowMs,
    max: limits[userPlan].max,
    keyGenerator: (req) => req.user?.id || req.ip,
    message: 'You have reached your plan limit, please upgrade'
  });

  return limiter(req, res, next);
};

module.exports = {
  apiLimiter,
  authLimiter,
  uploadLimiter,
  videoLimiter,
  planBasedLimiter
};
