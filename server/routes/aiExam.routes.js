import express from 'express';
import { generateAIExam } from '../controllers/aiExam.controller.js';

const router = express.Router();

router.post('/aiexam', generateAIExam);

export default router;
