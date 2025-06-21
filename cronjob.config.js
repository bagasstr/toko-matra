module.exports = {
  // URL aplikasi yang akan di-ping
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  
  // Interval ping dalam menit (default: 14 menit untuk Render free tier)
  intervalMinutes: parseInt(process.env.CRON_INTERVAL_MINUTES) || 14,
  
  // Timeout untuk request dalam milidetik
  timeoutMs: parseInt(process.env.CRON_TIMEOUT_MS) || 10000,
  
  // Endpoint health check
  healthEndpoint: '/api/health',
  
  // User agent untuk request
  userAgent: 'CronJob-HealthCheck/1.0',
  
  // Log level: 'info', 'warn', 'error', 'debug'
  logLevel: process.env.CRON_LOG_LEVEL || 'info',
  
  // Retry settings
  retry: {
    enabled: process.env.CRON_RETRY_ENABLED === 'true',
    maxAttempts: parseInt(process.env.CRON_RETRY_MAX_ATTEMPTS) || 3,
    delayMs: parseInt(process.env.CRON_RETRY_DELAY_MS) || 5000,
  }
}; 