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
    deleteMaterial,
    uploadImage,
    createDepartment,
    getDepartments,
    updateDepartment,
    deleteDepartment,
    addDeptAdmin,
    getDeptAdmins,
    deleteDeptAdmin,
    deleteNotice,
    updateAssignment,
    deleteAssignment,
    requestLimitIncrease,
    generateProjectContent,
    createOrgPlan,
    getOrgPlan,
    getAllOrgPlans,
    updateOrgPlanFeatures,
    deleteOrgPlan
} from '../controllers/org.controller.js';
import { getOrgCourseCount } from '../controllers/course.controller.js';
import Organization from '../models/Organization.js';
import { uploadAssignment, uploadCourseImage, uploadMaterial } from '../config/upload.config.js';

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
router.put('/org/assignment/:id', updateAssignment);
router.delete('/org/assignment/:id', deleteAssignment);
router.get('/org/assignment/:assignmentId/submissions', getSubmissions);
router.get('/org/assignment/certificate/:submissionId', getAssignmentCertificate);
router.post('/org/assignment/submission/:submissionId/grade', gradeSubmission);
router.post('/student/assignment/submit', uploadAssignment.single('file'), submitAssignment);

// Notices
router.post('/org/notice/create', createNotice);
router.get('/org/notices', getNotices);
router.delete('/org/notice/:id', deleteNotice);
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
router.get('/org/course-count', getOrgCourseCount);
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
// router.post('/org/material/create', createMaterial);
router.post(
    '/org/material/create',
    uploadMaterial.single('file'),
    createMaterial
);
router.get('/org/materials', getMaterials);
router.delete('/org/material/:id', deleteMaterial);

// File Uploads
router.post('/org/upload/image', uploadCourseImage.single('image'), uploadImage);

// Departments
router.post('/org/department/create', createDepartment);
router.get('/org/departments', getDepartments);
router.put('/org/department/:id', updateDepartment);
router.delete('/org/department/:id', deleteDepartment);

// Department Admins
router.post('/org/dept-admin/add', addDeptAdmin);
router.get('/org/dept-admins', getDeptAdmins);
router.delete('/org/dept-admin/:id', deleteDeptAdmin);

// Student Limit Increase Request
router.post('/org/limit-increase/request', requestLimitIncrease);

// Project AI Generation
router.post('/org/project/generate', generateProjectContent);

// Organization Plans (ADMIN)
router.post('/admin/org-plan/create', createOrgPlan);
router.get('/admin/org-plan', getOrgPlan);
router.get('/admin/org-plans', getAllOrgPlans);
router.put('/admin/org-plan/:organizationId/features', updateOrgPlanFeatures);
router.delete('/admin/org-plan/:organizationId', deleteOrgPlan);

export default router;
