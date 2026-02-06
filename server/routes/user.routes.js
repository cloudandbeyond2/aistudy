import express from 'express';
import {
  deleteUser,
  upgradeUser,
  getUserById
} from '../controllers/user.controller.js';

const router = express.Router();

router.get('/user/:userId', getUserById);
router.post('/deleteuser', deleteUser);
router.post('/admin/upgrade-user', upgradeUser);

export default router;
