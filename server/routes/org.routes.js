import express from 'express';
import {
    orgSignup,
    orgSignin,
    addStudent,
    getStudents,
    updateStudent,
    deleteStudent,
    bulkUploadStudents,
    getDashboardStats,
    createAssignment,
    getAssignments,
    getAssignment,
    submitAssignment,
    getSubmissions,
    createNotice,
    getNotices,
    getAllOrganizations,
    createCourse,
    getCourses,
    getStudentCourses,
    updateCourse,
    deleteCourse,
    updateOrganization,
    gradeSubmission,
    getAssignmentCertificate,
    createMeeting,
    getMeetings,
    deleteMeeting,
    createProject,
    getProjects,
    deleteProject,
    createMaterial,
    getMaterials,
    deleteMaterial
} from '../controllers/org.controller.js';
import Organization from '../models/Organization.js';
import { uploadAssignment } from '../config/upload.config.js';

const router = express.Router();

// Org Auth
router.post('/org/signup', orgSignup);
router.post('/org/signin', orgSignin);

// Student Management
router.post('/org/student/add', addStudent);
router.get('/org/students', getStudents);
router.put('/org/student/:studentId', updateStudent);
router.delete('/org/student/:studentId', deleteStudent);
router.post('/org/student/bulk-upload', bulkUploadStudents);

// Dashboard
router.get('/org/dashboard/stats', getDashboardStats);

// Assignments
router.post('/org/assignment/create', createAssignment);
router.get('/org/assignments', getAssignments); // ?organizationId=...
router.get('/org/assignment/:assignmentId', getAssignment);
router.get('/org/assignment/:assignmentId/submissions', getSubmissions);
router.get('/org/assignment/certificate/:submissionId', getAssignmentCertificate);
router.post('/org/assignment/submission/:submissionId/grade', gradeSubmission);
router.post('/student/assignment/submit', uploadAssignment.single('file'), submitAssignment);

// Notices
router.post('/org/notice/create', createNotice);
router.get('/org/notices', getNotices);
router.get('/org/details/:orgId', async (req, res) => {
    try {
        const org = await Organization.findById(req.params.orgId);
        if (!org) return res.status(404).json({ success: false, message: 'Organization not found' });
        res.json({ success: true, organization: org });
    } catch (e) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.get('/admin/orgs', getAllOrganizations);
router.put('/admin/org/:orgId', updateOrganization);

// Courses
router.post('/org/course/create', createCourse);
router.get('/org/courses', getCourses);
router.get('/student/courses', getStudentCourses);
router.put('/org/course/:courseId', updateCourse);
router.delete('/org/course/:courseId', deleteCourse);

// Meetings
router.post('/org/meeting/create', createMeeting);
router.get('/org/meetings', getMeetings);
router.delete('/org/meeting/:id', deleteMeeting);

// Projects
router.post('/org/project/create', createProject);
router.get('/org/projects', getProjects);
router.delete('/org/project/:id', deleteProject);

// Materials
router.post('/org/material/create', createMaterial);
router.get('/org/materials', getMaterials);
router.delete('/org/material/:id', deleteMaterial);

export default router;
