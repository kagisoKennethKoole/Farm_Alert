const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const cacheMiddleware = (duration = CACHE_DURATION) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    const key = req.originalUrl;
    const cached = cache.get(key);
    
    // Return cached response if valid
    if (cached && Date.now() - cached.timestamp < duration) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached.data);
    }
    
    // Store original json method
    const originalJson = res.json.bind(res);
    
    // Override json method to cache response
    res.json = (data) => {
      cache.set(key, {
        data,
        timestamp: Date.now()
      });
      res.setHeader('X-Cache', 'MISS');
      return originalJson(data);
    };
    
    next();
  };
};

// Clear expired cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      cache.delete(key);
    }
  }
}, CACHE_DURATION);

// Clear all cache
export const clearCache = () => {
  cache.clear();
  console.log('✅ Cache cleared');
};