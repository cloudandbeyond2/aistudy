import express from 'express';
import {
  deleteUser,
  upgradeUser,
  getUserById,
  getUserStats
} from '../controllers/user.controller.js';

const router = express.Router();

router.get('/user/:userId', getUserById);
router.get('/user-stats/:userId', getUserStats);
router.post('/deleteuser', deleteUser);
router.post('/admin/upgrade-user', upgradeUser);

export default router;
