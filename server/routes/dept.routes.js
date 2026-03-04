import express from 'express';
import { getDeptDashboardStats, getDeptStudents } from '../controllers/dept.controller.js';

const router = express.Router();

router.get('/dept/dashboard/stats', getDeptDashboardStats);
router.get('/dept/students', getDeptStudents);

export default router;
