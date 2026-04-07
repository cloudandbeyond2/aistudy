import express from 'express';
import {
  getAuthUrl,
  handleCallback,
  getStatus,
  syncEvents,
  disconnect,
} from '../controllers/googleCalendar.controller.js';

const router = express.Router();

router.get('/auth-url', getAuthUrl);
router.get('/callback', handleCallback);
router.get('/status', getStatus);
router.post('/sync', syncEvents);
router.delete('/disconnect', disconnect);

export default router;
