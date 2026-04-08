
import express from 'express';
import * as notificationController from '../controllers/notification.controller.js';

const router = express.Router();

router.post('/get', notificationController.getNotifications);
router.post('/read', notificationController.markAsRead);
router.post('/read-by-link', notificationController.markByLinkAsRead);
router.post('/clear', notificationController.clearNotifications);
router.post('/send-individual', notificationController.sendIndividualNotification);

export default router;
