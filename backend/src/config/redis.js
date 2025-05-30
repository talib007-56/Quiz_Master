const { createClient } = require('redis');
const dotenv = require('dotenv');

dotenv.config();

// Create Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Handle Redis connection events
redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
  }
})();

// Cache middleware
const cacheMiddleware = (duration) => {
  return async (req, res, next) => {
    try {
      // Skip cache if Redis is not connected
      if (!redisClient.isReady) {
        return next();
      }

      // Create a key based on the request URL
      const key = `cache:${req.originalUrl}`;

      // Try to get cached response
      const cachedResponse = await redisClient.get(key);
      
      if (cachedResponse) {
        // Return cached response
        return res.json(JSON.parse(cachedResponse));
      }

      // If no cache, override res.json to cache the response
      const originalJson = res.json;
      res.json = function(data) {
        // Cache the response for the specified duration
        redisClient.setEx(key, duration, JSON.stringify(data))
          .catch(error => console.error('Redis caching error:', error));
          
        // Call the original res.json
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

module.exports = { redisClient, cacheMiddleware }; 