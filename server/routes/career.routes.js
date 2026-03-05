import express from 'express';
import {
    getOrgPlacementStats,
    getStudentPlacementProfile,
    upsertPlacementProfile,
    submitStudentProject,
    getStudentProjects,
    deleteStudentProject,
    getOrgVerifiedCerts,
    getPublicPortfolio
} from '../controllers/career.controller.js';

const router = express.Router();

// Org admin routes
router.get('/org/placement-stats', getOrgPlacementStats);
router.get('/org/certificates', getOrgVerifiedCerts);

// Student career routes
router.get('/career/profile/:studentId', getStudentPlacementProfile);
router.post('/career/profile', upsertPlacementProfile);
router.post('/career/project', submitStudentProject);
router.get('/career/projects', getStudentProjects);
router.delete('/career/project/:id', deleteStudentProject);

// Public portfolio (no auth)
router.get('/career/public-portfolio/:studentId', getPublicPortfolio);

export default router;
