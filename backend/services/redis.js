const { createClient } = require('redis');

let client = null;
let isConnected = false;
let memoryStore = {}; // Fallback in-memory store

const getRedisClient = async () => {
  // If Redis is not available, use memory store as fallback
  if (process.env.USE_MEMORY_STORE === 'true') {
    console.log('⚠️ Using in-memory store (not suitable for production)');
    isConnected = true;
    return null;
  }

  if (!client) {
    try {
      client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          connectTimeout: 5000,
          lazyConnect: true,
          reconnectStrategy: (retries) => Math.min(retries * 50, 500)
        }
      });

      client.on('error', (err) => {
        console.error('Redis Client Error:', err);
        isConnected = false;
      });

      client.on('connect', () => {
        console.log(' Redis Client Connected');
        isConnected = true;
      });

      client.on('disconnect', () => {
        console.log(' Redis Client Disconnected');
        isConnected = false;
      });

      client.on('ready', () => {
        console.log(' Redis Client Ready');
        isConnected = true;
      });

      await client.connect();
    } catch (error) {
      console.error(' Failed to connect to Redis:', error);
      console.log(' Falling back to in-memory store');
      isConnected = true; // Pretend we're connected for fallback
      return null;
    }
  }
  return client;
};

const isRedisConnected = () => {
  // If using memory store, consider it "connected" for health check purposes
  if (process.env.USE_MEMORY_STORE === 'true') {
    return true;
  }
  return isConnected;
};

const setPaste = async (id, data) => {
  try {
    if (process.env.USE_MEMORY_STORE === 'true' || !client) {
      // Use memory store fallback
      memoryStore[id] = { ...data, timestamp: Date.now() };
      return true;
    }
    
    const redisClient = await getRedisClient();
    if (!redisClient) throw new Error('Redis client not available');
    
    const key = `paste:${id}`;
    const ttl = data.ttl_seconds || 86400; // Default 24 hours
    
    await redisClient.setEx(key, ttl, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error setting paste:', error);
    return false;
  }
};

const getPaste = async (id) => {
  try {
    if (process.env.USE_MEMORY_STORE === 'true' || !client) {
      // Use memory store fallback
      const stored = memoryStore[id];
      if (!stored) return null;
      
      // Check TTL for memory store
      if (stored.ttl_seconds && (Date.now() - stored.timestamp) > stored.ttl_seconds * 1000) {
        delete memoryStore[id];
        return null;
      }
      
      return { ...stored };
    }
    
    const redisClient = await getRedisClient();
    if (!redisClient) throw new Error('Redis client not available');
    
    const key = `paste:${id}`;
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting paste:', error);
    return null;
  }
};

const updatePaste = async (id, data) => {
  try {
    if (process.env.USE_MEMORY_STORE === 'true' || !client) {
      // Use memory store fallback
      const existing = memoryStore[id];
      if (!existing) return false;
      
      memoryStore[id] = { ...existing, ...data };
      return true;
    }
    
    const redisClient = await getRedisClient();
    if (!redisClient) throw new Error('Redis client not available');
    
    const key = `paste:${id}`;
    const existingData = await redisClient.get(key);
    
    if (!existingData) return false;
    
    const parsedData = JSON.parse(existingData);
    const updatedData = { ...parsedData, ...data };
    
    // Get remaining TTL
    const ttl = await redisClient.ttl(key);
    if (ttl > 0) {
      await redisClient.setEx(key, ttl, JSON.stringify(updatedData));
    } else {
      await redisClient.set(key, JSON.stringify(updatedData));
    }
    
    return true;
  } catch (error) {
    console.error('Error updating paste:', error);
    return false;
  }
};

const deletePaste = async (id) => {
  try {
    if (process.env.USE_MEMORY_STORE === 'true' || !client) {
      // Use memory store fallback
      delete memoryStore[id];
      return true;
    }
    
    const redisClient = await getRedisClient();
    if (!redisClient) throw new Error('Redis client not available');
    
    const key = `paste:${id}`;
    const result = await redisClient.del(key);
    return result > 0;
  } catch (error) {
    console.error('Error deleting paste:', error);
    return false;
  }
};

const getRedisInfo = async () => {
  try {
    if (process.env.USE_MEMORY_STORE === 'true' || !client) {
      return {
        connected: true,
        info: 'Using in-memory store (development mode)',
        memory_usage: Object.keys(memoryStore).length
      };
    }
    
    const redisClient = await getRedisClient();
    if (!redisClient) return null;
    
    const info = await redisClient.info();
    return {
      connected: isConnected,
      info: info.split('\r\n').slice(0, 5).join('\r\n') // First few lines
    };
  } catch (error) {
    console.error('Error getting Redis info:', error);
    return { connected: false, error: error.message };
  }
};

module.exports = {
  getRedisClient,
  isRedisConnected,
  setPaste,
  getPaste,
  updatePaste,
  deletePaste,
  getRedisInfo
};
