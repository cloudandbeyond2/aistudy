import express from 'express';
const router = express.Router();
import { getGlobalInterviewSettings, updateGlobalInterviewSettings } from '../controllers/superAdmin.controller.js';

// Super Admin only routes (Ideally should have a checkSuperAdmin middleware)
router.get('/super-admin/interview-settings', getGlobalInterviewSettings);
router.put('/super-admin/interview-settings', updateGlobalInterviewSettings);

export default router;
