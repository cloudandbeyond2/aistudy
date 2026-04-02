import express from 'express';
import { 
    createInternship, 
    getInternships, 
    getInternshipById, 
    updateInternship, 
    addTask, 
    updateTask, 
    addFollowup, 
    updateFollowup, 
    updateStudyPlan,
    getStudentInternship,
    generateRoadmap
} from '../controllers/internship.controller.js';

const router = express.Router();

router.post('/internship', createInternship);
router.post('/internship/generate-roadmap', generateRoadmap);
router.get('/internship', getInternships);
router.get('/internship/student/:studentId', getStudentInternship);
router.get('/internship/:id', getInternshipById);
router.patch('/internship/:id', updateInternship);

// Tasks
router.post('/internship/:id/task', addTask);
router.patch('/internship/:id/task/:taskId', updateTask);

// Daily Follow-ups
router.post('/internship/:id/followup', addFollowup);
router.patch('/internship/:id/followup/:followupId', updateFollowup);

// Study Plan
router.patch('/internship/:id/study-plan', updateStudyPlan);

export default router;
