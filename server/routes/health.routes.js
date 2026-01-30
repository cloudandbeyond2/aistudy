import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/health', async (req, res) => {
  let dbStatus = 'disconnected';
  let error = null;

  try {
    if (mongoose.connection.readyState === 1) {
      dbStatus = 'connected';
    } else if (mongoose.connection.readyState === 2) {
      dbStatus = 'connecting';
    } else {
      dbStatus = 'disconnected';
    }
  } catch (err) {
    dbStatus = 'error';
    error = err.message;
  }

  res.json({
    status: 'running',
    mongodb: dbStatus,
    readyState: mongoose.connection.readyState,
    error,
    env: {
      hasMongoURI: !!process.env.MONGODB_URI,
      nodeEnv: process.env.NODE_ENV
    },
    timestamp: new Date().toISOString()
  });
});

export default router;
