import express from 'express';
import {
  getProfile,
  setTopic,
  generateRoadmap,
  getDailyTip,
  logPractice,
  getPracticeLog,
  completeMilestone
} from '../controllers/skillBooster.controller.js';

const router = express.Router();

// Profile
router.get('/skill-booster/profile', getProfile);

// Topic
router.put('/skill-booster/topic', setTopic);

// AI Roadmap
router.post('/skill-booster/generate-roadmap', generateRoadmap);

// Daily Tip
router.get('/skill-booster/daily-tip', getDailyTip);

// Practice Log
router.post('/skill-booster/practice', logPractice);
router.get('/skill-booster/practice-log', getPracticeLog);

// Milestone completion
router.post('/skill-booster/milestone-complete', completeMilestone);

export default router;
