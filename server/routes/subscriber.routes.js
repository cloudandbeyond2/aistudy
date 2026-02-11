import express from 'express';
import { subscribe, getSubscribers } from '../controllers/subscriber.controller.js';

const router = express.Router();

router.post('/subscribe', subscribe);
router.get('/admin/subscribers', getSubscribers);

export default router;
