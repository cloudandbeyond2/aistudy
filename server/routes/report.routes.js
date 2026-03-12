import express from 'express';
import { getOverallAdminReport, getOrgStudentReport } from '../controllers/report.controller.js';

const router = express.Router();

// Super Admin: Overall KPI report
router.get('/admin/reports/overall', getOverallAdminReport);

// Org Admin: Student report with filtering
router.get('/org/reports/students', getOrgStudentReport);

export default router;
