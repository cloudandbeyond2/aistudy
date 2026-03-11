
import express from 'express';
import * as notificationController from '../controllers/notification.controller.js';

const router = express.Router();

router.post('/get', notificationController.getNotifications);
router.post('/read', notificationController.markAsRead);
router.post('/clear', notificationController.clearNotifications);

export default router;
