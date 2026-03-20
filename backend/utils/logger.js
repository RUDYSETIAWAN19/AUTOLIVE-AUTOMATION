const winston = require('winston');
const path = require('path');

const logDir = 'logs';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'autolive-api' },
  transports: [
    // Write all logs with level 'error' to error.log
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Write all logs with level 'info' to combined.log
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// If not in production, also log to console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Create stream for Morgan
logger.stream = {
  write: (message) => logger.info(message.trim())
};

// Custom log methods
logger.logRequest = (req, type = 'info') => {
  logger[type]({
    type: 'request',
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id
  });
};

logger.logError = (error, req = null) => {
  logger.error({
    type: 'error',
    message: error.message,
    stack: error.stack,
    code: error.code,
    url: req?.url,
    method: req?.method,
    userId: req?.user?.id
  });
};

logger.logPerformance = (action, duration, metadata = {}) => {
  logger.info({
    type: 'performance',
    action,
    duration,
    ...metadata
  });
};

logger.logSecurity = (event, userId, metadata = {}) => {
  logger.warn({
    type: 'security',
    event,
    userId,
    ...metadata,
    timestamp: new Date().toISOString()
  });
};

module.exports = logger;
