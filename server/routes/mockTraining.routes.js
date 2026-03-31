import express from 'express';
const router = express.Router();
import { 
  createMockDrive, 
  getMockDrives, 
  startMockSession, 
  chatWithAiInterviewer, 
  finalizeMockRound,
  updateTmrMockFeedback,
  getStudentMockStats,
  getAssignedDrives,
  getMockApplicationById,
  getOrganizationApplications,
  getStudentApplications
} from '../controllers/mockTraining.controller.js';
import { updatePlacementReady } from '../controllers/user.controller.js';




// Mock Drive management
router.post('/mock-interview/drive', createMockDrive);
router.get('/mock-interview/drives', getMockDrives);

// Live Interview Flow
router.post('/mock-interview/session', startMockSession);
router.post('/mock-interview/chat', chatWithAiInterviewer);
router.post('/mock-interview/finalize', finalizeMockRound);

router.post('/mock-interview/tmr-feedback', updateTmrMockFeedback);
router.put('/mock-interview/placement-ready', updatePlacementReady);

// Student Stats & Assignments
router.get('/mock-interview/stats', getStudentMockStats);
router.get('/mock-interview/assigned', getAssignedDrives);
router.get('/mock-interview/application/:id', getMockApplicationById);
router.get('/mock-interview/org-applications', getOrganizationApplications);
router.get('/mock-interview/my-history', getStudentApplications);




export default router;
