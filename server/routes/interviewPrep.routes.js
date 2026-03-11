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

// Apply paid user check middleware to all routes except maybe fetching current affairs snippet if we wanted, 
// but the requirement says all these features are for paid users.
router.use(checkPaidUser);

// Current Affairs
router.post('/interview-prep/current-affairs', createCurrentAffair); // Ideally admin only, but no admin middleware specified yet
router.get('/interview-prep/current-affairs', getCurrentAffairs);

// Daily Aptitude
router.post('/interview-prep/daily-aptitude', createDailyAptitude); // Ideally admin only
router.get('/interview-prep/daily-aptitude', getDailyAptitudes);

// Category Quiz Generation (AI)
router.post('/interview-prep/generate-category-quiz', generateCategoryQuiz);

export default router;
