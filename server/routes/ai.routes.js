import express from 'express';
import {
  generatePrompt,
  generateHtml,
  generateImage,
  generateVideo,
  generateTranscript,
  generateBatchSubtopics
} from '../controllers/ai.controller.js';

const router = express.Router();

router.post('/prompt', generatePrompt);
router.post('/generate', generateHtml);
router.post('/generate-batch', generateBatchSubtopics);
router.post('/image', generateImage);
router.post('/yt', generateVideo);
router.post('/transcript', generateTranscript);

export default router;
