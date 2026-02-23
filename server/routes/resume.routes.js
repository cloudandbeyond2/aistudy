import express from 'express';
import { getResume, getMyResume, saveResume } from '../controllers/resume.controller.js';

const router = express.Router();

// Authenticated — resume builder data (MUST be before the wildcard :userId route)
router.get('/resume/my/:userId', getMyResume);

// Authenticated — save/update resume
router.post('/resume', saveResume);

// Public — for share link (wildcard route LAST)
router.get('/resume/:userId', getResume);

export default router;
