const express = require('express');
const {isRedisConnected,getRedisInfo} = require('../services/redis');

const router =express.Router();

/**
 * Health check endpoint
 * GET  /api/healthz
 */
router.get('/', async(req, res) => {
  try {
    const redisStatus =isRedisConnected();
    const redisInfo =await getRedisInfo();
    
    // Determine if the persistence layer is working (either Redis or memory store)
    const persistenceWorking= redisStatus ||(redisInfo && redisInfo.info &&redisInfo.info.includes('in-memory store'));
    
    const healthData ={
      ok: persistenceWorking,
      timestamp: new Date().toISOString(),
      redis_connected: redisStatus,
      uptime: process.uptime(),
      memory:process.memoryUsage(),
      version:process.env.npm_package_version || '1.0.0'
    };

    // Add Redis info in development
    if (process.env.NODE_ENV === 'development' &&  redisInfo){
      healthData.redis_info = redisInfo.info;
    }

    // Set appropriate status code
    const statusCode = persistenceWorking ? 200 :  503;
    
    res.status(statusCode).json(healthData);
  } catch (error){
    console.error('Health check error:',error);
    res.status(503).json( {
      ok: false,
      timestamp:new Date().toISOString(),
      error: 'Health check failed',
      uptime:process.uptime()
    });
  }
});

module.exports= router;
