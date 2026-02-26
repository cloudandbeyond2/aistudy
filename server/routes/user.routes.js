import express from 'express';
import {
  deleteUser,
  upgradeUser,
  getUserById,
  getUserStats,
  updateSettings,
  requestAccountDeletion,
  getDeletionRequests,
  updateDeletionRequestStatus
} from '../controllers/user.controller.js';

const router = express.Router();

router.get('/user/:userId', getUserById);
router.get('/user-stats/:userId', getUserStats);
router.post('/deleteuser', deleteUser);
router.post('/admin/upgrade-user', upgradeUser);
router.post('/update-settings', updateSettings);
router.post('/request-deletion', requestAccountDeletion);

// Admin Routes
router.get('/admin/deletion-requests', getDeletionRequests);
router.put('/admin/deletion-request', updateDeletionRequestStatus);

export default router;
