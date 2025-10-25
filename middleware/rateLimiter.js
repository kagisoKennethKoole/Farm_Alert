const requestCounts = new Map();
const RATE_LIMIT = 100; // requests per window
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export const rateLimiter = (limit = RATE_LIMIT, windowMs = WINDOW_MS) => {
  return (req, res, next) => {
    const identifier = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!requestCounts.has(identifier)) {
      requestCounts.set(identifier, { 
        count: 1, 
        resetTime: now + windowMs 
      });
      
      res.setHeader('X-RateLimit-Limit', limit);
      res.setHeader('X-RateLimit-Remaining', limit - 1);
      res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());
      
      return next();
    }
    
    const userData = requestCounts.get(identifier);
    
    // Reset if window expired
    if (now > userData.resetTime) {
      userData.count = 1;
      userData.resetTime = now + windowMs;
      
      res.setHeader('X-RateLimit-Limit', limit);
      res.setHeader('X-RateLimit-Remaining', limit - 1);
      res.setHeader('X-RateLimit-Reset', new Date(userData.resetTime).toISOString());
      
      return next();
    }
    
    // Check if limit exceeded
    if (userData.count >= limit) {
      res.setHeader('X-RateLimit-Limit', limit);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', new Date(userData.resetTime).toISOString());
      res.setHeader('Retry-After', Math.ceil((userData.resetTime - now) / 1000));
      
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        retry_after_seconds: Math.ceil((userData.resetTime - now) / 1000)
      });
    }
    
    userData.count++;
    
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', limit - userData.count);
    res.setHeader('X-RateLimit-Reset', new Date(userData.resetTime).toISOString());
    
    next();
  };
};

// Cleanup old entries
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requestCounts.entries()) {
    if (now > value.resetTime) {
      requestCounts.delete(key);
    }
  }
}, WINDOW_MS);