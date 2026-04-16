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
  updatePlacementReady,
  uploadProfileImage
} from '../controllers/user.controller.js';
import { uploadProfilePhoto } from '../config/upload.config.js';

const router = express.Router();

router.get('/user/:userId', getUserById);
router.get('/user-stats/:userId', getUserStats);
router.post('/deleteuser', deleteUser);
router.post('/admin/upgrade-user', upgradeUser);
router.post('/update-settings', updateSettings);
router.post('/request-deletion', requestAccountDeletion);
router.post('/upload-profile-image', uploadProfilePhoto.single('image'), uploadProfileImage);
// Admin Routes
router.get('/admin/deletion-requests', getDeletionRequests);
router.put('/admin/deletion-request', updateDeletionRequestStatus);

export default router;
