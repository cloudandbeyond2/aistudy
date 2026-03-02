import express from 'express';
import {
  deleteUser,
  upgradeUser,
  getUserById,
  getUserStats,
  updateSettings,
  requestAccountDeletion,
  getDeletionRequests,
  updateDeletionRequestStatus,
  requestCancellation,
  getCancellationRequests,
  updateCancellationRequestStatus
} from '../controllers/user.controller.js';

const router = express.Router();

router.get('/user/:userId', getUserById);
router.get('/user-stats/:userId', getUserStats);
router.post('/deleteuser', deleteUser);
router.post('/admin/upgrade-user', upgradeUser);
router.post('/update-settings', updateSettings);
router.post('/request-deletion', requestAccountDeletion);
router.post('/request-cancellation', requestCancellation);

// Admin Routes
router.get('/admin/deletion-requests', getDeletionRequests);
router.put('/admin/deletion-request', updateDeletionRequestStatus);

router.get('/admin/cancellation-requests', getCancellationRequests);
router.put('/admin/cancellation-request', updateCancellationRequestStatus);

export default router;
