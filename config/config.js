import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  host: process.env.HOST || 'localhost',
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || '*',
  
  // Rate limiting
  rateLimit: {
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 900000 // 15 minutes
  },
  
  // Cache
  cache: {
    duration: parseInt(process.env.CACHE_DURATION) || 300000 // 5 minutes
  },
  
  // Data file path
  dataFilePath: process.env.DATA_FILE_PATH || 'data/sa_agri_enhanced.json'
};
