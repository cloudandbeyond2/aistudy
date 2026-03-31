import express from 'express';
import { 
  checkPaidUser,
  createCurrentAffair,
  getCurrentAffairs,
  createDailyAptitude,
  getDailyAptitudes,
  generateCategoryQuiz
} from '../controllers/interviewPrep.controller.js';

const router = express.Router();

// Routes with checkPaidUser middleware
// Current Affairs
router.post('/interview-prep/current-affairs', checkPaidUser, createCurrentAffair); 
router.get('/interview-prep/current-affairs', checkPaidUser, getCurrentAffairs);

// Daily Aptitude
router.post('/interview-prep/daily-aptitude', checkPaidUser, createDailyAptitude); 
router.get('/interview-prep/daily-aptitude', checkPaidUser, getDailyAptitudes);

// Category Quiz Generation (AI)
router.post('/interview-prep/generate-category-quiz', checkPaidUser, generateCategoryQuiz);

export default router;
