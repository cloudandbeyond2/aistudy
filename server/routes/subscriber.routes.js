import express from 'express';
import { subscribe, getSubscribers, sendMessageToAllSubscribers } from '../controllers/subscriber.controller.js';

const router = express.Router();

router.post('/subscribe', subscribe);
router.get('/admin/subscribers', getSubscribers);
router.post('/admin/send-message', sendMessageToAllSubscribers);

export default router;
