import express from 'express';
import {
  deleteUser,
  upgradeUser
} from '../controllers/user.controller.js';

const router = express.Router();

router.post('/deleteuser', deleteUser);
router.post('/admin/upgrade-user', upgradeUser);

export default router;
