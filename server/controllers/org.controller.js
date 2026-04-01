import Organization from '../models/Organization.js';
import User from '../models/User.js';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import Notice from '../models/Notice.js';
import OrgCourse from '../models/OrgCourse.js';
import Course from '../models/Course.js';
import OrganizationPlan from '../models/OrganizationPlan.js';
import LoginActivity from '../models/LoginActivity.js';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import Meeting from '../models/Meeting.js';
import Department from '../models/Department.js';
import StudentProgress from '../models/StudentProgress.js';
import LimitRequest from '../models/LimitRequest.js';
import ProjectModel from '../models/Project.js';
import MaterialModel from '../models/Material.js';
import StaffCourseLimitRequest from '../models/StaffCourseLimitRequest.js';
import DeptCourseLimitRequest from '../models/DeptCourseLimitRequest.js';
import { createNotification } from './notification.controller.js';
import { getChatModel } from '../config/genai.js';
import { sendMail } from '../services/mail.service.js';
import { recordLoginActivity } from '../services/loginActivity.service.js';
import { getOrgPlanDurationDays, getUserAccessFromOrgPlan } from '../utils/orgPlanAccess.js';
// import { generateAssignments } from './ai.controller.js'; // Will implement this export next

const isLegacyPublishedCourse = (course) => {
    if (!course) return false;
    if (!course.approvalStatus) return course.isPublished !== false;
    return course.approvalStatus === 'approved' && course.isPublished !== false;
};

const canRequesterAccessCourse = ({ course, requesterId, requesterRole, organizationId }) => {
    if (!course) return false;
    if (isLegacyPublishedCourse(course)) return true;

    const normalizedRequesterId = String(requesterId || '');
    const normalizedOrgId = String(organizationId || '');
    const courseOrgId = String(course.organizationId || '');
    const courseCreatedBy = String(course.createdBy || '');

    if (!normalizedRequesterId || normalizedOrgId !== courseOrgId) return false;
    if (['org_admin', 'dept_admin'].includes(requesterRole)) return true;
    return normalizedRequesterId === courseCreatedBy;
};

/**
 * ORGANIZATION SIGNUP
 */
export const orgSignup = async (req, res) => {
    const { name, email, password, address, contactNumber, allowAICreation, allowManualCreation, planDuration, planName } = req.body;

    try {
        // Check if Org exists
        const existingOrg = await Organization.findOne({ email });
        if (existingOrg) {
            return res.json({ success: false, message: 'Organization with this email already exists' });
        }

        // Check if User exists (as Admin or Regular User)
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: 'A user account with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const selectedPlan = planDuration || planName || 'free';
        const userAccess = getUserAccessFromOrgPlan(selectedPlan);
        const newOrg = new Organization({
            name,
            email,
            password: hashedPassword,
            address,
            contactNumber,
            plan: selectedPlan,
            allowAICreation: allowAICreation !== undefined ? allowAICreation : true,
            allowManualCreation: allowManualCreation !== undefined ? allowManualCreation : true
        });

        await newOrg.save();

        // Create a User account for the Org Admin
        const adminUser = new User({
            email,
            mName: name + ' Admin',
            phone: contactNumber,
            password: hashedPassword,
            role: 'org_admin',
            type: userAccess.type,
            organization: newOrg._id,
            isEmailVerified: true,
            isOrganization: true,
            subscriptionStart: userAccess.subscriptionStart,
            subscriptionEnd: userAccess.subscriptionEnd
        });
        await adminUser.save();

        // Send welcome email to Org
        try {
            await sendMail({
                to: email,
                subject: `Welcome to ${process.env.COMPANY || "Colossus IQ"}! - Organization Registered`,
                html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Organization Registered</title>
</head>
<body style="margin:0;padding:0;background:#f2f2f2;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
<tr>
<td align="center">
<table width="700" cellpadding="0" cellspacing="0" style="background:#e9e9e9;border-radius:10px;border:1px solid #d0d0d0;">
<tr>
<td style="padding:35px 40px; color:#333;">
<h2 style="text-align:center;margin-top:0;margin-bottom:25px;color:#333;">Organization Registered Successfully!</h2>
<p>Hello <strong>${name}</strong>,</p>
<p>Congratulations! Your organization has been successfully registered on <strong>${process.env.COMPANY || "Colossus IQ Ai Solutions"}</strong>.</p>
<p>You can now log in to manage your students, courses, and assignments from the dashboard.</p>
<div style="text-align:center;margin:35px 0;">
<a href="${process.env.WEBSITE_URL}/login" style="background:#1a73e8;color:#ffffff;text-decoration:none;padding:12px 26px;border-radius:6px;font-weight:bold;display:inline-block;font-size:15px;">Login to Dashboard</a>
</div>
<hr style="border:none;border-top:1px solid #cfcfcf;margin:30px 0;">
<p style="text-align:center;font-size:12px;color:#666;margin-bottom:0;">
© ${new Date().getFullYear()} ${process.env.COMPANY || "Colossus IQ Ai Solutions"}. All rights reserved.
</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>
`
            });
        } catch (mailErr) {
            console.error("Org Signup Mail Send Error:", mailErr);
        }

        res.json({ success: true, message: 'Organization registered successfully', orgId: newOrg._id });
    } catch (error) {
        console.error("Org Signup Error:", error);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

/**
 * ORGANIZATION SIGNIN
 */
export const orgSignin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const org = await Organization.findOne({ email });
        if (!org) {
            return res.json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, org.password);
        if (!isMatch) {
            return res.json({ success: false, message: 'Invalid credentials' });
        }

        if (org.isBlocked) {
            return res.json({ success: false, message: 'Your organization account is blocked. Please contact support.' });
        }

        // Find the admin user user for this org
        const user = await User.findOne({ email, role: 'org_admin' });
        if (user) {
            user.lastLoginAt = new Date();
            user.loginCount = (user.loginCount || 0) + 1;
            await user.save();
            await recordLoginActivity({ user, req });
        }

        res.json({ success: true, message: 'Login successful', org, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * HELPER: GET ORGANIZATION STUDENT LIMIT
 */
const getOrgStudentLimit = async (organizationId) => {
    const org = await Organization.findById(organizationId);
    if (!org) return 0;

    if (org.customStudentLimit > 0) return org.customStudentLimit;

    const slotLimits = {
        1: 50,
        2: 100,
        3: 150,
        4: 200
    };

    return slotLimits[org.studentSlot] || 50;
};

/**
 * ADD STUDENT (Single)
 */
export const addStudent = async (req, res) => {
    const { email, name, phone, password, department, section, rollNo, studentClass, classId, organizationId, academicYear } = req.body;

    try {
        // --- STUDENT LIMIT CHECK ---
        const limit = await getOrgStudentLimit(organizationId);
        const currentCount = await User.countDocuments({ organization: organizationId, role: 'student' });

        if (currentCount >= limit) {
            return res.json({ 
                success: false, 
                message: `Student limit reached (${limit}). Please contact admin or request for a limit increase.`,
                limitReached: true 
            });
        }
        // ---------------------------

        let user = await User.findOne({ email });
        if (user) {
            return res.json({ success: false, message: 'User with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password || '123456', 10);

        user = new User({
            email,
            mName: name,
            phone,
            password: hashedPassword,
            role: 'student',
            organization: organizationId,
            department: department && department !== 'all' ? department : null,

            studentDetails: {
                section,
                rollNo,
                studentClass,
                classId,
                academicYear
            },
            isVerified: true
        });

        await user.save();

        // Send welcome email to student
        try {
            await sendMail({
                to: email,
                subject: `Account Created - ${process.env.COMPANY || "Colossus IQ"}`,
                html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Student Account Created</title>
</head>
<body style="margin:0;padding:0;background:#f2f2f2;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
<tr>
<td align="center">
<table width="700" cellpadding="0" cellspacing="0" style="background:#e9e9e9;border-radius:10px;border:1px solid #d0d0d0;">
<tr>
<td style="padding:35px 40px; color:#333;">
<h2 style="text-align:center;margin-top:0;margin-bottom:25px;color:#333;">Welcome to the Platform!</h2>
<p>Hello <strong>${name}</strong>,</p>
<p>An account has been created for you on <strong>${process.env.COMPANY || "Colossus IQ Ai Solutions"}</strong> by your organization.</p>
<p>You can now log in using the following details:</p>
<ul style="list-style:none;padding:0;">
<li><strong>Login URL:</strong> <a href="${process.env.WEBSITE_URL}/login">${process.env.WEBSITE_URL}/login</a></li>
<li><strong>Email:</strong> ${email}</li>
</ul>
<p>Please use the password provided by your organization or use the "Forgot Password" feature if you need to set a new one.</p>
<div style="text-align:center;margin:35px 0;">
<a href="${process.env.WEBSITE_URL}/login" style="background:#1a73e8;color:#ffffff;text-decoration:none;padding:12px 26px;border-radius:6px;font-weight:bold;display:inline-block;font-size:15px;">Go to Dashboard</a>
</div>
<hr style="border:none;border-top:1px solid #cfcfcf;margin:30px 0;">
<p style="text-align:center;font-size:12px;color:#666;margin-bottom:0;">
© ${new Date().getFullYear()} ${process.env.COMPANY || "Colossus IQ Ai Solutions"}. All rights reserved.
</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>
`
            });
        } catch (mailErr) {
            console.error("Student Addition Mail Send Error:", mailErr);
        }

        res.json({ success: true, message: 'Student added successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * GET STUDENTS (For Organization)
 */
export const getStudents = async (req, res) => {
    const { organizationId } = req.query;
    try {
        const students = await User.find({ organization: organizationId, role: 'student' })
            .select('-password')
            .sort({ createdAt: -1 });
        res.json({ success: true, students });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * UPDATE STUDENT
 */
export const updateStudent = async (req, res) => {
    const { studentId } = req.params;
    // const { name, email, department, section, rollNo, studentClass, class: className } = req.body;
    const { name, email, department, section, rollNo, studentClass, classId, academicYear, placementCompany, placementPosition, isPlacementClosed } = req.body;

    try {
        // const updates = {
        //     mName: name,
        //     email,
        //     department: department && department !== 'all' ? department : null,
        //     'studentDetails.section': section,
        //     'studentDetails.rollNo': rollNo,
        //     'studentDetails.studentClass': studentClass || className,
        //     updatedAt: Date.now()
        // };
        const updates = {
            mName: name,
            email,
            department: department && department !== 'all' ? department : null,
            'studentDetails.section': section,
            'studentDetails.rollNo': rollNo,
            'studentDetails.studentClass': studentClass,
            'studentDetails.classId': classId, // ✅ add this
            'studentDetails.academicYear': academicYear,
            updatedAt: Date.now()
        };

        if (placementCompany !== undefined) updates['studentDetails.placementCompany'] = placementCompany;
        if (placementPosition !== undefined) updates['studentDetails.placementPosition'] = placementPosition;
        if (isPlacementClosed !== undefined) updates['studentDetails.isPlacementClosed'] = isPlacementClosed;

        const student = await User.findByIdAndUpdate(studentId, updates, { new: true });
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        res.json({ success: true, message: 'Student updated successfully', student });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * DELETE STUDENT
 */
export const deleteStudent = async (req, res) => {
    const { studentId } = req.params;
    try {
        const student = await User.findByIdAndDelete(studentId);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        res.json({ success: true, message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * BULK UPLOAD STUDENTS
 */
export const bulkUploadStudents = async (req, res) => {
    const { students, organizationId } = req.body;
 
    if (!organizationId) {
        return res.status(400).json({ success: false, message: "organizationId is required" });
    }
    if (!Array.isArray(students)) {
        return res.status(400).json({ success: false, message: "Invalid data format" });
    }
 
    try {
        const limit = await getOrgStudentLimit(organizationId);
        const currentCount = await User.countDocuments({ organization: organizationId, role: 'student' });
 
        if (currentCount >= limit) {
            return res.json({
                success: false,
                message: `Student limit reached (${limit}).`,
                limitReached: true
            });
        }
 
        // ✅ FIX 1: Pre-load all departments for this org once (avoid N+1 DB calls)
        const allDepartments = await Department.find({ organizationId });
 
        const remainingSlots = limit - currentCount;
        const studentsToProcess = students.slice(0, remainingSlots);
 
        let addedCount = 0;
        const errors = [];
 
        for (const student of studentsToProcess) {
            const { email, name, password, department, section, rollNo, studentClass, academicYear } = student;
 
            if (!email) {
                errors.push(`Missing email for ${name || 'unknown'}`);
                continue;
            }
 
            const existing = await User.findOne({ email });
            if (existing) {
                errors.push(`Email ${email} already exists`);
                continue;
            }
 
            // ✅ FIX 2: Resolve department name → ObjectId
            // Excel has "CS", "IT" etc. — find matching dept by name (case-insensitive)
            let resolvedDepartmentId = null;
            if (department) {
                const matchedDept = allDepartments.find(
                    d => d.name.toLowerCase() === String(department).toLowerCase()
                );
                if (matchedDept) {
                    resolvedDepartmentId = matchedDept._id;
                } else {
                    // ✅ FIX 3: Don't fail — just log and continue without dept
                    console.warn(`⚠️ Department "${department}" not found for org ${organizationId}`);
                    errors.push(`Warning: Department "${department}" not found for ${email} — added without department`);
                }
            }
 
            const hashedPassword = await bcrypt.hash(password || 'Student@123', 10);
 
            await new User({
                email,
                mName: name || "Student",
                password: hashedPassword,
                role: 'student',
                organization: organizationId,
                department: resolvedDepartmentId,  // ✅ ObjectId or null — never raw string
                studentDetails: {
                    section,
                    rollNo,
                    studentClass: studentClass || "",
                    academicYear
                },
                isVerified: true
            }).save();
 
            addedCount++;
        }
 
        res.json({
            success: true,
            message: `Successfully added ${addedCount} student${addedCount !== 1 ? 's' : ''}${errors.length > 0 ? ` (${errors.length} warning${errors.length !== 1 ? 's' : ''})` : ''}`,
            errors
        });
 
    } catch (error) {
        console.error("🔥 BULK ERROR:", error.message);
        return res.status(500).json({ success: false, message: error.message || "Server error" });
    }
};

/**
 * GET DASHBOARD STATS
 */
export const getDashboardStats = async (req, res) => {
    const { organizationId } = req.query;
    try {
        const studentCount = await User.countDocuments({ organization: organizationId, role: 'student' });
        const assignmentCount = await Assignment.countDocuments({ organizationId });

        // Filter submissions by assignments belonging to this organization
        const assignments = await Assignment.find({ organizationId }).select('_id');
        const assignmentIds = assignments.map(a => a._id);
        const submissionCount = await Submission.countDocuments({ assignmentId: { $in: assignmentIds } });

        // Course Stats Aggregation
        const orgCoursesCount = await OrgCourse.countDocuments({ organizationId });
        const aiCoursesCount = await Course.countDocuments({ organizationId });
        const totalCoursesCount = orgCoursesCount + aiCoursesCount;

        // Get student IDs to filter progress
        const students = await User.find({ organization: organizationId, role: 'student' }).select('_id');
        const studentIds = students.map(s => s._id);

        const completedCoursesCount = await StudentProgress.countDocuments({
            userId: { $in: studentIds },
            percentage: 100
        });

        const inProgressCoursesCount = await StudentProgress.countDocuments({
            userId: { $in: studentIds },
            percentage: { $lt: 100, $gt: 0 }
        });

        // Placement Stats
        const placedCount = await User.countDocuments({
            organization: organizationId,
            role: 'student',
            'studentDetails.isPlacementClosed': true
        });

 
        const studentLimit = await getOrgStudentLimit(organizationId);

        res.json({
            success: true,
            studentCount,
            studentLimit,
            assignmentCount,
            submissionCount,
            totalCoursesCount,
            completedCoursesCount,
            inProgressCoursesCount,
            placedCount
        });
    } catch (error) {
        console.error('getDashboardStats error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * CREATE ASSIGNMENT
 */
export const createAssignment = async (req, res) => {
    const { organizationId, topic, description, dueDate, department, questions } = req.body;
    try {
        const parsedDepartment = department && department !== 'all' ? department : undefined;
        const assignment = new Assignment({
            organizationId,
            topic,
            description,
            dueDate,
            department: parsedDepartment,
            questions
        });
        await assignment.save();

        // Send notifications to students
        try {
            let studentQuery = { organization: organizationId, role: 'student' };
            if (department && department !== 'all') {
                studentQuery['department'] = department;
            }

            const students = await User.find(studentQuery).select('_id');

            const notificationPromises = students.map(student =>
                createNotification({
                    user: student._id,
                    message: `New assignment created: ${topic}`,
                    type: 'info',
                    link: '/dashboard/student/assignments'
                })
            );
            await Promise.all(notificationPromises);
        } catch (notifError) {
            console.error("Failed to send assignment notifications:", notifError);
            // Don't fail the request if notifications fail
        }

        res.json({ success: true, message: 'Assignment created', assignment });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * GET ASSIGNMENTS (For Students or Org)
 */
export const getAssignments = async (req, res) => {
    const { organizationId, studentId } = req.query;
    try {
        let query = { organizationId };

        if (studentId) {
            const student = await User.findById(studentId);
            if (student) {
                const department = student.department || student.studentDetails?.department;
                if (department && department !== '' && department !== 'all') {
                    // Valid department ObjectId
                    query.$or = [
                        { assignedTo: studentId },
                        { department: department },
                        { department: { $exists: false } },
                        { department: null }
                    ];
                } else {
                    // No valid department, allow global ones
                    query.$or = [
                        { assignedTo: studentId },
                        { department: { $exists: false } },
                        { department: null }
                    ];
                }
            }
        }

        let assignments = await Assignment.find(query).sort({ createdAt: -1 });

        if (studentId) {
            const submissions = await Submission.find({ studentId }).sort({ submittedAt: -1 });

            assignments = assignments.map(assign => {
                const latestSubmission = submissions.find(s => s.assignmentId.toString() === assign._id.toString());
                const isSubmitted = latestSubmission && latestSubmission.status !== 'resubmit_required';

                return {
                    ...assign.toObject(),
                    isSubmitted,
                    latestSubmissionStatus: latestSubmission ? latestSubmission.status : null,
                    latestGrade: latestSubmission ? latestSubmission.grade : null,
                    latestSubmissionId: latestSubmission ? latestSubmission._id : null
                };
            });
        }

        res.json({ success: true, assignments });
    } catch (error) {
        console.error('getAssignments error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * GET SINGLE ASSIGNMENT
 */
export const getAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.assignmentId);
        if (!assignment) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }
        res.json({ success: true, assignment });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * UPDATE ASSIGNMENT
 */
export const updateAssignment = async (req, res) => {
    const { id } = req.params;
    const { topic, description, dueDate, department, questions } = req.body;
    try {
        const parsedDepartment = department && department !== 'all' ? department : undefined;
        const assignment = await Assignment.findByIdAndUpdate(
            id,
            { topic, description, dueDate, department: parsedDepartment, questions },
            { new: true }
        );
        if (!assignment) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }
        res.json({ success: true, message: 'Assignment updated successfully', assignment });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * DELETE ASSIGNMENT
 */
export const deleteAssignment = async (req, res) => {
    try {
        await Assignment.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Assignment deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * GET ASSIGNMENT SUBMISSIONS
 */
export const getSubmissions = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const submissions = await Submission.find({ assignmentId })
            .populate('studentId', 'mName email phone studentDetails')
            .sort({ submittedAt: -1 });
        res.json({ success: true, submissions });
    } catch (error) {
        console.error('getSubmissions error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * SUBMIT ASSIGNMENT
 */
export const submitAssignment = async (req, res) => {
    const { assignmentId, studentId, content } = req.body;
    const fileUrl = req.file ? `/uploads/assignments/${req.file.filename}` : req.body.fileUrl;
    try {
        // Check for due date
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }

        if (new Date() > new Date(assignment.dueDate)) {
            return res.status(400).json({ success: false, message: 'Assignment is overdue. Submission closed.' });
        }

        const submission = new Submission({
            assignmentId,
            studentId,
            content,
            fileUrl,
            text: content,   // ✅ MUST BE THIS
            status: 'submitted'
        });
        await submission.save();
        res.json({ success: true, message: 'Assignment submitted' });
    } catch (error) {
        console.error('submitAssignment error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * CREATE NOTICE
 */
export const createNotice = async (req, res) => {
    const { organizationId, title, content, audience, department } = req.body;

    try {
        const parsedDepartment = department && department !== 'all' ? department : undefined;
        const notice = new Notice({ organizationId, title, content, audience, department: parsedDepartment });
        await notice.save();

        try {
            let studentQuery = { organization: organizationId, role: 'student' };
            if (parsedDepartment) studentQuery['department'] = parsedDepartment;

            const students = await User.find(studentQuery).select('_id');
            const notificationPromises = students.map(student =>
                createNotification({
                    user: student._id,
                    message: `New notice posted: ${title}`,
                    type: 'info',
                    link: '/dashboard/student/notices'
                })
            );
            await Promise.all(notificationPromises);
        } catch (notifError) {
            console.error("Failed to send notice notifications:", notifError);
        }

        res.json({ success: true, message: 'Notice created' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * GET NOTICES
 */
export const getNotices = async (req, res) => {
    const { organizationId, studentId } = req.query;
    try {
        let query = { organizationId };

        if (studentId) {
            const student = await User.findById(studentId);
            if (student) {
                const department = student.department || student.studentDetails?.department;
                if (department && department !== '' && department !== 'all') {
                    query.$or = [
                        { department: department },
                        { department: { $exists: false } },
                        { department: null }
                    ];
                } else {
                    query.$or = [
                        { department: { $exists: false } },
                        { department: null }
                    ];
                }
            }
        }

        const notices = await Notice.find(query).sort({ createdAt: -1 });
        res.json({ success: true, notices });
    } catch (error) {
        console.error('getNotices error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * DELETE NOTICE
 */
export const deleteNotice = async (req, res) => {
    try {
        await Notice.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Notice deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * GET ALL ORGANIZATIONS (Super Admin)
 */
export const getAllOrganizations = async (req, res) => {
    try {
        const organizations = await Organization.find().sort({ createdAt: -1 });
        res.json({ success: true, organizations });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const updateOrganization = async (req, res) => {
    const { orgId } = req.params;
    const updates = req.body;
    try {
        const org = await Organization.findByIdAndUpdate(orgId, updates, { new: true });
        if (!org) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }
        res.json({ success: true, message: 'Organization updated successfully', org });
    } catch (error) {
        console.error('Update org error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * CREATE COURSE (Organization)
 */
export const createCourse = async (req, res) => {
    const { organizationId, title, description, type, department, topics, quizzes, quizSettings, assignedTo, createdBy, courseMeta, isAiGenerated } = req.body;
    try {
        const creator = createdBy ? await User.findById(createdBy).select('_id role department coursesCreatedCount courseLimit') : null;

        // Enforce org-level course limit
        const orgPlan = await OrganizationPlan.findOne({ organization: organizationId, isActive: true });
        if (orgPlan) {
            const orgCoursesCount = await OrgCourse.countDocuments({ organizationId });
            const aiCoursesCount = await Course.countDocuments({ organizationId });
            const totalCreatedCount = orgCoursesCount + aiCoursesCount;

            if (totalCreatedCount >= orgPlan.aiCourseSlots) {
                return res.status(403).json({
                    success: false,
                    message: `Organization course creation limit reached (${orgPlan.aiCourseSlots}). Please contact your administrator or upgrade your plan.`
                });
            }
        }

        // Enforce course limit for dept_admin
        if (creator && creator.role === 'dept_admin') {
            if (creator.coursesCreatedCount >= creator.courseLimit) {
                return res.status(403).json({
                    success: false,
                    message: `Course creation limit reached (${creator.courseLimit}). Please contact your organization administrator.`
                });
            }
        }

        const parsedDepartment =
            creator?.role === 'dept_admin'
                ? creator.department || undefined
                : (department && department !== 'all' ? department : undefined);

        if (creator?.role === 'dept_admin' && !parsedDepartment) {
            return res.status(403).json({
                success: false,
                message: 'Department admins can only create courses for their assigned department.'
            });
        }

        const course = new OrgCourse({
            organizationId,
            title,
            description,
            type: type || 'video & text course',
            isAiGenerated: Boolean(isAiGenerated),
            courseMeta: courseMeta || {},
            department: parsedDepartment,
            approvalStatus: 'draft',
            isPublished: false,
            topics: topics || [],
            quizzes: quizzes || [],
            quizSettings: quizSettings || {},
            assignedTo: assignedTo || [], // Specific students or empty for all
            createdBy
        });
        await course.save();

        // Increment coursesCreatedCount for creator if they are dept_admin
        if (createdBy) {
            await User.findByIdAndUpdate(createdBy, { $inc: { coursesCreatedCount: 1 } });
        }

        res.json({ success: true, message: 'Course created successfully', course });
    } catch (error) {
        console.error('Create course error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * GET COURSES (For Organization)
 */
export const getCourses = async (req, res) => {
    const { organizationId } = req.query;
    try {
        const orgCourses = await OrgCourse.find({ organizationId }).sort({ createdAt: -1 });
        const aiCourses = await Course.find({ organizationId }).sort({ createdAt: -1 });

        // Transform aiCourses to match OrgCourse shape if needed or return both
        // For simplicity, we combine them. The frontend will handle the differences.
        const combined = [...orgCourses, ...aiCourses];

        res.json({ success: true, courses: combined });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * GET STUDENT COURSES (For Student Portal)
 */
export const getStudentCourses = async (req, res) => {
    const { studentId, organizationId } = req.query;
    try {
        // Find the student to get their department
        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const rawDepartment = student.department || student.studentDetails?.department || '';
        let departmentId = '';
        let departmentName = '';
        if (rawDepartment && mongoose.Types.ObjectId.isValid(String(rawDepartment))) {
            departmentId = String(rawDepartment);
            const deptDoc = await Department.findById(departmentId).select('name');
            departmentName = deptDoc?.name || '';
        } else {
            departmentName = String(rawDepartment || '');
        }
        const departmentValues = [departmentId, departmentName].filter(Boolean);

        console.log('Fetching courses for student:', { studentId, departmentId, departmentName, organizationId });

        // Get courses assigned to this student, or this department, or all students (empty assignedTo and department)
        const visibilityOr = {
            $or: [
                { approvalStatus: { $exists: false } },
                { approvalStatus: 'approved', isPublished: true },
                { approvalStatus: 'approved', isPublished: { $exists: false } }
            ]
        };

        const assignmentOr = {
            $or: [
                { assignedTo: studentId }, // Specifically assigned to this student
                ...(departmentValues.length > 0 ? [{ department: { $in: departmentValues } }] : []), // Assigned to their department
                {
                    $and: [
                        { assignedTo: { $size: 0 } },
                        { $or: [{ department: { $exists: false } }, { department: '' }, { department: 'all' }] }
                    ]
                } // Assigned to all
            ]
        };

        const orgCourses = await OrgCourse.find({
            organizationId,
            $and: [visibilityOr, assignmentOr]
        }).sort({ createdAt: -1 });

        // Also fetch AI generated courses with same department filtering logic
        const aiDepartmentOr = departmentValues.length > 0
            ? [
                { department: { $in: departmentValues } },
                { $or: [{ department: { $exists: false } }, { department: '' }, { department: null }] }
            ]
            : [{ $or: [{ department: { $exists: false } }, { department: '' }, { department: null }] }];

        const aiCourses = await Course.find({
            organizationId,
            approvalStatus: 'approved',
            isPublished: true,
            $and: [visibilityOr, { $or: aiDepartmentOr }]
        }).sort({ createdAt: -1 });

        const combined = [...orgCourses, ...aiCourses];

        // Fetch progress for each course
        const coursesWithProgress = await Promise.all(combined.map(async (course) => {
            const progress = await StudentProgress.findOne({ userId: studentId, courseId: course._id });
            return {
                ...((course.toObject ? course.toObject() : course)),
                progressPercentage: progress?.percentage || 0
            };
        }));

        res.json({ success: true, courses: coursesWithProgress });
    } catch (error) {
        console.error('Get student courses error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * UPDATE COURSE
 */
export const updateCourse = async (req, res) => {
    const { courseId } = req.params;
    const { updatedBy, ...updates } = req.body;
    console.log('Update course request:', { courseId, updates });
    try {
        const updater = updatedBy ? await User.findById(updatedBy).select('_id role department') : null;
        if (updater?.role === 'dept_admin' && updates.department !== undefined) {
            updates.department = updater.department || updates.department;
        }

        delete updates.approvalStatus;
        delete updates.isPublished;
        delete updates.reviewedBy;
        delete updates.reviewedAt;
        delete updates.publishedBy;
        delete updates.publishedAt;
        delete updates.approvalNote;

        // Try to update OrgCourse first (manual courses)
        let course = await OrgCourse.findByIdAndUpdate(
            courseId,
            { ...updates, updatedAt: Date.now() },
            { new: true }
        );
        console.log('OrgCourse result:', course ? 'Found and updated' : 'Not found');

        // If not found, try updating Course (AI-generated courses)
        if (!course) {
            console.log('Not found in OrgCourse, trying Course model...');
            // First check if it exists
            const existingCourse = await Course.findById(courseId);
            console.log('Existing AI course check:', existingCourse ? 'Exists' : 'Does not exist');

            if (existingCourse) {
                course = await Course.findByIdAndUpdate(
                    courseId,
                    { ...updates },
                    { new: true }
                );
                if (course) {
                    console.log('Successfully updated AI course:', course);
                }
            }
        }

        if (!course) {
            console.log('Course not found in either model');
            return res.status(404).json({ success: false, message: 'Course not found' });
        }
        res.json({ success: true, message: 'Course updated successfully', course });
    } catch (error) {
        console.error('Update course error:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
};

/**
 * REVIEW ORG COURSE (Org Admin)
 * approvalStatus: approved | rejected | pending
 */
export const reviewOrgCourse = async (req, res) => {
    const { courseId } = req.params;
    const { reviewerId, approvalStatus, approvalNote } = req.body;

    try {
        if (!courseId) return res.status(400).json({ success: false, message: 'courseId is required' });
        if (!reviewerId) return res.status(400).json({ success: false, message: 'reviewerId is required' });
        if (!['approved', 'rejected', 'pending'].includes(String(approvalStatus || ''))) {
            return res.status(400).json({ success: false, message: 'Invalid approvalStatus' });
        }

        const reviewer = await User.findById(reviewerId).select('_id role organization isBlocked');
        if (!reviewer || reviewer.isBlocked) {
            return res.status(403).json({ success: false, message: 'Reviewer is not allowed' });
        }

        // Only org_admin can approve/reject. dept_admin can only set to pending (submit for review).
        if (reviewer.role !== 'org_admin') {
            if (reviewer.role === 'dept_admin' && approvalStatus === 'pending') {
                // Allowed to submit for review
            } else {
                return res.status(403).json({ success: false, message: 'Only organization admins can approve or reject courses' });
            }
        }

        let course = await OrgCourse.findById(courseId);
        if (!course) {
            course = await Course.findById(courseId);
        }

        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
        if (String(course.organizationId) !== String(reviewer.organization)) {
            return res.status(403).json({ success: false, message: 'Course does not belong to this organization' });
        }

        const previousApprovalStatus = String(course.approvalStatus || '');
        course.approvalStatus = String(approvalStatus);
        course.reviewedBy = reviewer._id;
        course.reviewedAt = new Date();
        course.approvalNote = String(approvalNote || '');

        // If it is not approved, force it back to unpublished.
        if (course.approvalStatus !== 'approved') {
            course.isPublished = false;
            course.publishedBy = null;
            course.publishedAt = null;
        }

        await course.save();

        if (String(approvalStatus) === 'pending' && previousApprovalStatus !== 'pending') {
            try {
                const orgAdmins = await User.find({
                    role: 'org_admin',
                    organization: reviewer.organization,
                    isBlocked: { $ne: true }
                }).select('_id');
                await Promise.all(orgAdmins
                    .filter((admin) => String(admin._id) !== String(reviewer._id))
                    .map((admin) => createNotification({
                        user: admin._id,
                        type: 'approval',
                        message: `Course pending approval: ${course.title || 'Untitled course'}`,
                        link: '/dashboard/org?tab=approvals'
                    })));
            } catch (notifyError) {
                console.error('Failed to notify org admins about pending course approval:', notifyError);
            }
        }
        res.json({ success: true, message: 'Course review updated', course });
    } catch (error) {
        console.error('Review org course error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * PUBLISH / UNPUBLISH ORG COURSE (Org Admin)
 */
export const setOrgCoursePublishState = async (req, res) => {
    const { courseId } = req.params;
    const { publisherId, isPublished } = req.body;

    try {
        if (!courseId) return res.status(400).json({ success: false, message: 'courseId is required' });
        if (!publisherId) return res.status(400).json({ success: false, message: 'publisherId is required' });
        if (typeof isPublished !== 'boolean') {
            return res.status(400).json({ success: false, message: 'isPublished (boolean) is required' });
        }

        const publisher = await User.findById(publisherId).select('_id role organization isBlocked');
        if (!publisher || publisher.isBlocked) {
            return res.status(403).json({ success: false, message: 'Publisher is not allowed' });
        }
        if (publisher.role !== 'org_admin') {
            return res.status(403).json({ success: false, message: 'Only organization admins can publish courses' });
        }

        let course = await OrgCourse.findById(courseId);
        if (!course) {
            course = await Course.findById(courseId);
        }

        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
        if (String(course.organizationId) !== String(publisher.organization)) {
            return res.status(403).json({ success: false, message: 'Course does not belong to this organization' });
        }

        const isLegacy = !course.approvalStatus;

        // New workflow: must be approved before publishing (legacy courses can be toggled without migration).
        if (!isLegacy && course.approvalStatus !== 'approved' && isPublished) {
            return res.status(400).json({ success: false, message: 'Course must be approved before publishing' });
        }

        course.isPublished = Boolean(isPublished);
        course.publishedBy = course.isPublished ? publisher._id : null;
        course.publishedAt = course.isPublished ? new Date() : null;

        await course.save();
        res.json({ success: true, message: `Course ${course.isPublished ? 'published' : 'unpublished'}`, course });
    } catch (error) {
        console.error('Publish org course error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * STAFF LOGIN ACTIVITY (Org Admin)
 */
export const getOrgStaffLoginActivity = async (req, res) => {
    const { organizationId, requesterId, limit } = req.query;

    try {
        if (!organizationId) return res.status(400).json({ success: false, message: 'organizationId is required' });
        if (!requesterId) return res.status(400).json({ success: false, message: 'requesterId is required' });

        const requester = await User.findById(requesterId).select('_id role organization isBlocked');
        if (!requester || requester.isBlocked || requester.role !== 'org_admin') {
            return res.status(403).json({ success: false, message: 'Not allowed' });
        }
        if (String(requester.organization) !== String(organizationId)) {
            return res.status(403).json({ success: false, message: 'Organization mismatch' });
        }

        const resolvedLimit = Math.min(Math.max(parseInt(String(limit || '200'), 10) || 200, 1), 500);
        const logs = await LoginActivity.find({
            organization: organizationId,
            activityType: 'login',
            role: { $in: ['org_admin', 'dept_admin'] }
        })
            .sort({ createdAt: -1 })
            .limit(resolvedLimit)
            .lean();

        res.json({ success: true, logs });
    } catch (error) {
        console.error('Get org staff login activity error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * DELETE COURSE
 */
export const deleteCourse = async (req, res) => {
    const { courseId } = req.params;
    try {
        let course = await OrgCourse.findByIdAndDelete(courseId);
        if (!course) {
            // Try standard Course
            course = await Course.findByIdAndDelete(courseId);
        }

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }
        res.json({ success: true, message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * GRADE SUBMISSION
 */
export const gradeSubmission = async (req, res) => {
    const { submissionId } = req.params;
    const { grade } = req.body;

    try {
        const submission = await Submission.findById(submissionId);
        if (!submission) {
            return res.status(404).json({ success: false, message: 'Submission not found' });
        }

        submission.grade = grade;
        // If grade is 'E', force resubmission
        if (grade === 'E') {
            submission.status = 'resubmit_required';
        } else {
            submission.status = 'graded';
        }

        await submission.save();

        res.json({ success: true, message: 'Grade updated successfully', submission });
    } catch (error) {
        console.error('Grade submission error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * GET ASSIGNMENT CERTIFICATE DATA
 */
export const getAssignmentCertificate = async (req, res) => {
    const { submissionId } = req.params;
    try {
        const submission = await Submission.findById(submissionId)
            .populate('studentId', 'mName')
            .populate('assignmentId', 'topic');

        if (!submission) {
            return res.status(404).json({ success: false, message: 'Submission not found' });
        }

        if (['A', 'B', 'C', 'D'].includes(submission.grade)) {
            res.json({
                success: true,
                certificate: {
                    studentName: submission.studentId.mName,
                    assignmentTopic: submission.assignmentId.topic,
                    grade: submission.grade,
                    grade: submission.grade,
                    date: submission.submittedAt || submission.updatedAt || submission.createdAt
                }
            });
        } else {
            res.status(400).json({ success: false, message: 'Certificate not available for this grade.' });
        }

    } catch (error) {
        console.error('Certificate error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


/**
 * MEETINGS
 */
export const createMeeting = async (req, res) => {
    const { organizationId, title, link, platform, date, time, department } = req.body;
    try {
        const parsedDepartment = department && department !== 'all' ? department : undefined;
        const meeting = new Meeting({ organizationId, title, link, platform, date, time, department: parsedDepartment });
        await meeting.save();

        try {
            let studentQuery = { organization: organizationId, role: 'student' };
            if (parsedDepartment) studentQuery['department'] = parsedDepartment;

            const students = await User.find(studentQuery).select('_id');
            const notificationPromises = students.map(student =>
                createNotification({
                    user: student._id,
                    message: `New meeting scheduled: ${title}`,
                    type: 'primary',
                    link: '/dashboard/student/meetings'
                })
            );
            await Promise.all(notificationPromises);
        } catch (notifError) {
            console.error("Failed to send meeting notifications:", notifError);
        }

        res.json({ success: true, message: 'Meeting created', meeting });
    } catch (error) {
        console.error('Create Meeting Error:', error);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

export const getMeetings = async (req, res) => {
    const { organizationId, studentId } = req.query;
    try {
        let query = { organizationId };
        if (studentId) {
            const student = await User.findById(studentId);
            if (student) {
                const department = student.department || student.studentDetails?.department;
                query.$or = [{ department: department }, { department: 'all' }, { department: '' }];
            }
        }
        const meetings = await Meeting.find(query).sort({ date: 1, time: 1 });
        res.json({ success: true, meetings });
    } catch (error) {
        console.error('Get Meetings Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const deleteMeeting = async (req, res) => {
    try {
        await Meeting.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Meeting deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * PROJECTS
 */
export const createProject = async (req, res) => {
    const { organizationId, title, description, type, department, dueDate, guidance, subtopics, isAiGenerated } = req.body;
    try {
        const parsedDepartment = department && department !== 'all' ? department : undefined;
        const project = new ProjectModel({ 
            organizationId, 
            title, 
            description, 
            type, 
            department: parsedDepartment, 
            dueDate,
            guidance,
            subtopics,
            isAiGenerated
        });
        await project.save();

        try {
            let studentQuery = { organization: organizationId, role: 'student' };
            if (parsedDepartment) studentQuery['department'] = parsedDepartment;

            const students = await User.find(studentQuery).select('_id');
            const notificationPromises = students.map(student =>
                createNotification({
                    user: student._id,
                    message: `New project created: ${title}`,
                    type: 'success',
                    link: '/dashboard/student/projects'
                })
            );
            await Promise.all(notificationPromises);
        } catch (notifError) {
            console.error("Failed to send project notifications:", notifError);
        }

        res.json({ success: true, message: 'Project created', project });
    } catch (error) {
        console.error('Create Project Error:', error);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

/**
 * GENERATE PROJECT CONTENT USING AI
 */
export const generateProjectContent = async (req, res) => {
    const { topic, type } = req.body;

    if (!topic) {
        return res.status(400).json({ success: false, message: 'Topic is required' });
    }

    try {
        const model = await getChatModel();
        const prompt = `
            Generate a detailed project structure for an educational platform.
            Project Topic/Keywords: ${topic}
            Project Type: ${type || 'Project'}

            Respond ONLY with a JSON object in the following format:
            {
                "title": "A compelling project title",
                "description": "A comprehensive project description (HTML/Markdown supported)",
                "guidance": "Detailed guidance/steps for students to complete the project",
                "subtopics": ["Subtopic 1", "Subtopic 2", "Subtopic 3"]
            }
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        // Extract JSON from response (sometimes AI wraps it in code blocks)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('Failed to parse AI response');
        
        const content = JSON.parse(jsonMatch[0]);
        res.json({ success: true, content });
    } catch (error) {
        console.error('Generate Project Content Error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate content' });
    }
};

export const getProjects = async (req, res) => {
    const { organizationId, studentId } = req.query;
    try {
        let query = {
            organizationId,
            type: { $ne: 'Showcase' } // Exclude student-created showcase projects
        };
        if (studentId) {
            const student = await User.findById(studentId);
            if (student) {
                const conditions = [
                    { department: { $exists: false } },
                    { department: null }
                ];

                const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(String(id));
                const dept1 = student.department;
                const dept2 = student.studentDetails?.department;

                if (dept1 && isValidObjectId(dept1)) conditions.push({ department: dept1 });
                if (dept2 && isValidObjectId(dept2)) conditions.push({ department: dept2 });

                query.$or = conditions;
            }
        }
        const projects = await ProjectModel.find(query).sort({ createdAt: -1 });
        res.json({ success: true, projects });
    } catch (error) {
        console.error('getProjects Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const deleteProject = async (req, res) => {
    try {
        await ProjectModel.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Project deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * MATERIALS
 */
// export const createMaterial = async (req, res) => {
//     const { organizationId, title, description, fileUrl, type, department } = req.body;
//     try {
//         const material = new Material({ organizationId, title, description, fileUrl, type, department });
//         await material.save();
//         res.json({ success: true, message: 'Material added', material });
//     } catch (error) {
//         console.error('Create Material Error:', error);
//         res.status(500).json({ success: false, message: error.message || 'Server error' });
//     }
// };

export const createMaterial = async (req, res) => {
    try {
        const {
            organizationId,
            title,
            description,
            fileUrl,
            type,
            department
        } = req.body;

        let finalFileUrl = fileUrl;

        // If PDF and file uploaded
        if (type === 'PDF' && req.file) {
            finalFileUrl = process.env.VERCEL
                ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
                : req.file.path;
        }

        if (!finalFileUrl) {
            return res.status(400).json({
                success: false,
                message: 'File or URL is required'
            });
        }

        const parsedDepartment = department && department !== 'all' ? department : undefined;

        const material = new MaterialModel({
            organizationId,
            title,
            description,
            fileUrl: finalFileUrl,
            type,
            department: parsedDepartment
        });

        await material.save();

        try {
            let studentQuery = { organization: organizationId, role: 'student' };
            if (parsedDepartment) studentQuery['department'] = parsedDepartment;

            const students = await User.find(studentQuery).select('_id');
            const notificationPromises = students.map(student =>
                createNotification({
                    user: student._id,
                    message: `New material posted: ${title}`,
                    type: 'warning',
                    link: '/dashboard/student/materials'
                })
            );
            await Promise.all(notificationPromises);
        } catch (notifError) {
            console.error("Failed to send material notifications:", notifError);
        }

        res.json({
            success: true,
            message: 'Material added successfully',
            material
        });

    } catch (error) {
        console.error('Create Material Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

export const getMaterials = async (req, res) => {
    const { organizationId, studentId } = req.query;
    try {
        let query = { organizationId };
        if (studentId) {
            const student = await User.findById(studentId);
            if (student) {
                const department = student.studentDetails?.department;
                query.$or = [
                    { department: department },
                    { department: { $exists: false } },
                    { department: null },
                    { department: '' },
                    { department: 'all' }
                ];
            }
        }
        const materials = await MaterialModel.find(query).sort({ createdAt: -1 });
        res.json({ success: true, materials });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const deleteMaterial = async (req, res) => {
    try {
        await MaterialModel.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Material deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * DEPARTMENTS
 */
export const createDepartment = async (req, res) => {
    const { organizationId, name, description } = req.body;
    try {
        const department = new Department({ organizationId, name, description });
        await department.save();
        res.json({ success: true, message: 'Department created', department });
    } catch (error) {
        console.error('Create Department Error:', error);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

export const getDepartments = async (req, res) => {
    const { organizationId } = req.query;
    try {
        const departments = await Department.find({ organizationId }).sort({ name: 1 });
        res.json({ success: true, departments });
    } catch (error) {
        console.error('Get Departments Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const updateDepartment = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    try {
        const department = await Department.findByIdAndUpdate(id, { name, description, updatedAt: Date.now() }, { new: true });
        res.json({ success: true, message: 'Department updated', department });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const deleteDepartment = async (req, res) => {
    try {
        await Department.findByIdAndDelete(req.params.id);
        // Also unset department from users
        await User.updateMany({ department: req.params.id }, { $set: { department: null } });
        res.json({ success: true, message: 'Department deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * DEPARTMENT ADMINS
 */
export const addDeptAdmin = async (req, res) => {
    const { organizationId, departmentId, name, email, password, phone, courseLimit } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.json({ success: false, message: 'User with this email already exists' });
        }

        const organization = await Organization.findById(organizationId).select('plan');
        const orgPlan = await OrganizationPlan.findOne({ organization: organizationId, isActive: true }).select('planName startDate endDate');
        const effectivePlan = orgPlan?.planName || organization?.plan || 'free';
        const userAccess = getUserAccessFromOrgPlan(effectivePlan, orgPlan?.startDate || new Date());

        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({
            email,
            mName: name,
            phone,
            password: hashedPassword,
            role: 'dept_admin',
            organization: organizationId,
            department: departmentId,
            courseLimit: courseLimit || 0,
            isEmailVerified: true,
            isOrganization: false,
            type: userAccess.type,
            subscriptionStart: orgPlan?.startDate || userAccess.subscriptionStart,
            subscriptionEnd: orgPlan?.endDate || userAccess.subscriptionEnd
        });

        await user.save();
        res.json({ success: true, message: 'Department Admin added successfully' });
    } catch (error) {
        console.error('Add Dept Admin Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
export const updateDeptAdmin = async (req, res) => {
    const { id } = req.params;
    const { name, departmentId, courseLimit, password, phone } = req.body;
    
    try {
        const admin = await User.findById(id);
        if (!admin) {
            return res.status(404).json({ success: false, message: 'Department admin not found' });
        }
        
        // Check if user is a dept_admin
        if (admin.role !== 'dept_admin') {
            return res.status(400).json({ success: false, message: 'User is not a department admin' });
        }
        
        // Update fields
        if (name) admin.mName = name;
        if (departmentId) admin.department = departmentId;
        if (courseLimit !== undefined) admin.courseLimit = courseLimit;
        if (phone !== undefined) admin.phone = phone;
        
        // Update password if provided
        if (password && password.trim() !== '') {
            const bcrypt = await import('bcryptjs');
            admin.password = await bcrypt.hash(password, 10);
        }
        
        await admin.save();
        
        res.json({ 
            success: true, 
            message: 'Department admin updated successfully',
            admin: {
                _id: admin._id,
                mName: admin.mName,
                email: admin.email,
                phone: admin.phone,
                department: admin.department,
                courseLimit: admin.courseLimit,
                role: admin.role
            }
        });
    } catch (error) {
        console.error('Update Dept Admin Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getDeptAdmins = async (req, res) => {
    const { organizationId, departmentId } = req.query;
    try {
        let query = { organization: organizationId, role: 'dept_admin' };
        if (departmentId) query.department = departmentId;

        const admins = await User.find(query)
            .populate('department', 'name')
            .select('-password')
            .sort({ lastLoginAt: -1, date: -1 });

        res.json({ success: true, admins });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const deleteDeptAdmin = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Department Admin deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * UPLOAD COURSE IMAGE
 */
export const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Return the path to the uploaded file
        const fileUrl = `/uploads/courses/${req.file.filename}`;
        res.json({ success: true, url: fileUrl });
    } catch (error) {
        console.error('Upload image error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
/**
 * REQUEST STUDENT LIMIT INCREASE
 */
export const requestLimitIncrease = async (req, res) => {
    const { organizationId, adminId, requesterId, requestedSlot, requestedCustomLimit } = req.body;

    if (!organizationId) {
        return res.status(400).json({ success: false, message: 'Missing organizationId' });
    }

    try {
        let resolvedAdminId = adminId || requesterId;
        if (!resolvedAdminId) {
            const orgAdmin = await User.findOne({ organization: organizationId, role: 'org_admin' }).select('_id');
            resolvedAdminId = orgAdmin?._id;
        }
        if (!resolvedAdminId) {
            return res.status(404).json({ success: false, message: 'Organization admin not found' });
        }

        const newRequest = new LimitRequest({
            organizationId,
            adminId: resolvedAdminId,
            requestedSlot,
            requestedCustomLimit
        });

        await newRequest.save();

        res.json({ success: true, message: 'Limit increase request submitted successfully' });
    } catch (error) {
        console.error('requestLimitIncrease error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * REQUEST STAFF COURSE LIMIT INCREASE (Org Admin -> Super Admin)
 */
export const requestStaffCourseLimitIncrease = async (req, res) => {
    const { organizationId, requesterId, staffId, requestedCourseLimit } = req.body;

    if (!organizationId || !staffId) {
        return res.status(400).json({ success: false, message: 'Missing organizationId or staffId' });
    }

    const parsedRequested = parseInt(String(requestedCourseLimit || ''), 10);
    if (!Number.isFinite(parsedRequested) || parsedRequested < 0) {
        return res.status(400).json({ success: false, message: 'requestedCourseLimit must be a valid number (>= 0)' });
    }

    try {
        let resolvedRequesterId = requesterId;
        if (!resolvedRequesterId) {
            const orgAdmin = await User.findOne({ organization: organizationId, role: 'org_admin' }).select('_id');
            resolvedRequesterId = orgAdmin?._id;
        }
        if (!resolvedRequesterId) {
            return res.status(404).json({ success: false, message: 'Organization admin not found' });
        }

        const requester = await User.findById(resolvedRequesterId).select('_id role organization isBlocked');
        if (!requester || requester.isBlocked || requester.role !== 'org_admin') {
            return res.status(403).json({ success: false, message: 'Only organization admins can request staff course limit changes' });
        }
        if (String(requester.organization) !== String(organizationId)) {
            return res.status(403).json({ success: false, message: 'Organization mismatch' });
        }

        const staff = await User.findById(staffId).select('_id role organization courseLimit isBlocked mName email');
        if (!staff || staff.isBlocked || staff.role !== 'dept_admin') {
            return res.status(404).json({ success: false, message: 'Staff member not found' });
        }
        if (String(staff.organization) !== String(organizationId)) {
            return res.status(403).json({ success: false, message: 'Staff member does not belong to this organization' });
        }

        const current = staff.courseLimit || 0;
        if (parsedRequested === current) {
            return res.status(400).json({ success: false, message: 'Requested limit is the same as current limit' });
        }

        const existingPending = await StaffCourseLimitRequest.findOne({
            organizationId,
            staffId,
            status: 'pending'
        });
        if (existingPending) {
            existingPending.requestedCourseLimit = parsedRequested;
            existingPending.currentCourseLimit = current;
            existingPending.requestedBy = requester._id;
            await existingPending.save();
            return res.json({ success: true, message: 'Request updated successfully', request: existingPending });
        }

        const newRequest = new StaffCourseLimitRequest({
            organizationId,
            requestedBy: requester._id,
            staffId,
            currentCourseLimit: current,
            requestedCourseLimit: parsedRequested
        });

        await newRequest.save();
        res.json({ success: true, message: 'Staff course limit request submitted successfully', request: newRequest });
    } catch (error) {
        console.error('requestStaffCourseLimitIncrease error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * DEPT ADMIN COURSE LIMIT REQUESTS -> ORG ADMIN
 */

// 1. Dept Admin requests limit from Org Admin
export const createDeptCourseLimitRequest = async (req, res) => {
    const { organizationId, deptAdminId, requestedCourseLimit } = req.body;

    if (!organizationId || !deptAdminId) {
        return res.status(400).json({ success: false, message: 'Missing organizationId or deptAdminId' });
    }

    const parsedRequested = parseInt(String(requestedCourseLimit || ''), 10);
    if (!Number.isFinite(parsedRequested) || parsedRequested <= 0) {
        return res.status(400).json({ success: false, message: 'Requested limit must be a valid positive number' });
    }

    try {
        const staff = await User.findById(deptAdminId).select('_id role organization isBlocked mName email');
        if (!staff || staff.isBlocked || staff.role !== 'dept_admin') {
            return res.status(404).json({ success: false, message: 'Department admin not found or blocked' });
        }
        if (String(staff.organization) !== String(organizationId)) {
            return res.status(403).json({ success: false, message: 'Department admin does not belong to this organization' });
        }

        const notifyOrgAdmins = async (requestDoc) => {
            try {
                const orgAdmins = await User.find({ role: 'org_admin', organization: organizationId, isBlocked: { $ne: true } }).select('_id');
                const staffLabel = staff.mName || staff.email || 'A department admin';
                await Promise.all(orgAdmins.map((admin) => createNotification({
                    user: admin._id,
                    type: 'approval',
                    message: `${staffLabel} requested +${parsedRequested} course slots.`,
                    link: '/dashboard/org?tab=approvals'
                })));
            } catch (notifyError) {
                console.error('Failed to notify org admins of dept course limit request:', notifyError);
            }
        };

        // Check for existing pending request to prevent spam
        const existingPending = await DeptCourseLimitRequest.findOne({
            organizationId,
            deptAdminId,
            status: 'pending'
        });

        if (existingPending) {
            existingPending.requestedCourseLimit = parsedRequested;
            await existingPending.save();
            await notifyOrgAdmins(existingPending);
            return res.json({ success: true, message: 'Existing request updated successfully', request: existingPending });
        }

        const newRequest = new DeptCourseLimitRequest({
            organizationId,
            deptAdminId,
            requestedCourseLimit: parsedRequested
        });

        await newRequest.save();
        await notifyOrgAdmins(newRequest);
        res.json({ success: true, message: 'Course limit request submitted to Organization Admin', request: newRequest });
    } catch (error) {
        console.error('createDeptCourseLimitRequest error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// 2. Org Admin or Dept Admin gets requests
export const getDeptCourseLimitRequests = async (req, res) => {
    const { organizationId, deptAdminId } = req.query;

    if (!organizationId) {
        return res.status(400).json({ success: false, message: 'Missing organizationId' });
    }

    try {
        let query = { organizationId };
        if (deptAdminId) {
            query.deptAdminId = deptAdminId;
        }

        const requests = await DeptCourseLimitRequest.find(query)
            .populate('deptAdminId', 'mName email courseLimit coursesCreatedCount')
            .sort({ createdAt: -1 });

        res.json({ success: true, requests });
    } catch (error) {
        console.error('getDeptCourseLimitRequests error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// 3. Org Admin processes (approves/rejects) request
export const processDeptCourseLimitRequest = async (req, res) => {
    const { requestId, status, adminComment, orgAdminId } = req.body;

    if (!requestId || !status) {
        return res.status(400).json({ success: false, message: 'Missing requestId or status' });
    }

    const normalizedStatus = String(status || '').toLowerCase();
    if (!['approved', 'rejected'].includes(normalizedStatus)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    try {
        const request = await DeptCourseLimitRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }
        
        if (request.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Request is already processed' });
        }

        // Verify Org Admin
        const orgAdmin = await User.findById(orgAdminId).select('_id role organization courseLimit coursesCreatedCount');
        if (!orgAdmin || orgAdmin.role !== 'org_admin' || String(orgAdmin.organization) !== String(request.organizationId)) {
            return res.status(403).json({ success: false, message: 'Unauthorized org_admin' });
        }

        if (normalizedStatus === 'approved') {
            const requestedAmount = request.requestedCourseLimit;
            
            const poolLimit = Number(orgAdmin.courseLimit || 0);
            const createdCount = Number(orgAdmin.coursesCreatedCount || 0);
            const usesPool = poolLimit > 0;
            const orgAdminAvailable = usesPool ? Math.max(poolLimit - createdCount, 0) : Infinity;

            // If org_admin has a configured pool (courseLimit > 0), enforce it. Otherwise treat as unlimited.
            if (usesPool && orgAdminAvailable < requestedAmount) {
                return res.status(400).json({
                    success: false,
                    message: `Organization Admin does not have enough remaining limit. (Available: ${orgAdminAvailable}, Requested: ${requestedAmount})`
                });
            }

            if (usesPool) {
                orgAdmin.courseLimit = Math.max(0, poolLimit - requestedAmount);
                await orgAdmin.save();
            }

            // Add to Dept Admin courseLimit
            const deptAdmin = await User.findById(request.deptAdminId);
            if (deptAdmin) {
                deptAdmin.courseLimit = (deptAdmin.courseLimit || 0) + requestedAmount;
                await deptAdmin.save();
            }
        }

        request.status = normalizedStatus;
        request.adminComment = String(adminComment || '');
        request.processedAt = new Date();
        await request.save();

        res.json({ success: true, message: 'Request processed successfully', request });
    } catch (error) {
        console.error('processDeptCourseLimitRequest error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * HELPER: GET PLAN DURATION IN DAYS
 */
function getPlanDuration(planName) {
    return getOrgPlanDurationDays(planName) || 30;
}

/**
 * CREATE OR UPDATE ORGANIZATION PLAN (ADMIN)
 */
export const createOrgPlan = async (req, res) => {
    const {
        organizationId,
        planName,
        additionalRequestSlots,
        studentSlotPrice,
        paymentMode,
        paymentStatus,
        paidByName,
        paidByEmail,
        transactionId,
        paymentDate
    } = req.body;

    try {
        console.log('🔍 Creating plan for org:', organizationId, 'Plan:', planName);

        // Validate plan name
        const validPlans = ['1months', '3months', '6months'];
        if (!validPlans.includes(planName)) {
            return res.json({
                success: false,
                message: 'Invalid plan. Choose: 1months, 3months, or 6months'
            });
        }

        // Check if organization exists
        const org = await Organization.findById(organizationId);
        if (!org) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        console.log('✅ Organization found:', org.name);

        // Check if plan already exists for this organization
        let plan = await OrganizationPlan.findOne({ organization: organizationId });

        if (plan) {
            // Update existing plan
            console.log('📝 Updating existing plan');
            plan.planName = planName;
            plan.additionalRequestSlots = additionalRequestSlots || 0;
            plan.studentSlotPrice = studentSlotPrice || 1000;
            plan.paymentMode = paymentMode || 'online';
            plan.paymentStatus = paymentStatus || 'paid';
            plan.paidByName = paidByName || '';
            plan.paidByEmail = paidByEmail || '';
            plan.transactionId = transactionId || '';
            plan.paymentDate = paymentDate ? new Date(paymentDate) : new Date();
            plan.isActive = true;
            plan.startDate = new Date();
        } else {
            // Create new plan
            console.log('✨ Creating new plan');
            plan = new OrganizationPlan({
                organization: organizationId,
                planName,
                additionalRequestSlots: additionalRequestSlots || 0,
                studentSlotPrice: studentSlotPrice || 1000,
                paymentMode: paymentMode || 'online',
                paymentStatus: paymentStatus || 'paid',
                paidByName: paidByName || '',
                paidByEmail: paidByEmail || '',
                transactionId: transactionId || '',
                paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
                features: {
                    allowAICreation: org.allowAICreation,
                    allowManualCreation: org.allowManualCreation,
                    allowCareerPlacement: org.allowCareerPlacement
                },
                startDate: new Date()
            });
        }

        await plan.save();
        console.log('💾 Plan saved to database');

        // Update organization with the selected plan
        org.plan = planName;
        await org.save();
        const userAccess = getUserAccessFromOrgPlan(planName, plan.startDate || new Date());
        await User.updateMany(
            { organization: organizationId, role: { $in: ['org_admin', 'dept_admin'] } },
            {
                $set: {
                    type: userAccess.type,
                    subscriptionStart: plan.startDate || userAccess.subscriptionStart,
                    subscriptionEnd: plan.endDate || userAccess.subscriptionEnd
                }
            }
        );
        console.log('✅ Organization updated with plan:', planName);

        res.json({
            success: true,
            message: 'Organization plan created/updated successfully',
            plan: {
                ...plan.toObject(),
                planDuration: getPlanDuration(planName),
                daysRemaining: Math.ceil((new Date(plan.endDate) - new Date()) / (1000 * 60 * 60 * 24))
            }
        });
    } catch (error) {
        console.error('❌ Create org plan error:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
};

/**
 * GET ORGANIZATION PLAN (ADMIN)
 */
export const getOrgPlan = async (req, res) => {
    const { organizationId } = req.query;

    try {
        const plan = await OrganizationPlan.findOne({ organization: organizationId })
            .populate('organization', 'name email plan allowAICreation allowManualCreation');

        if (!plan) {
            return res.json({
                success: true,
                message: 'No plan assigned yet',
                plan: null
            });
        }

        res.json({
            success: true,
            plan: {
                ...plan.toObject(),
                planDuration: getPlanDuration(plan.planName),
                daysRemaining: Math.ceil((new Date(plan.endDate) - new Date()) / (1000 * 60 * 60 * 24))
            }
        });
    } catch (error) {
        console.error('Get org plan error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * GET ALL ORGANIZATION PLANS (ADMIN DASHBOARD)
 */
export const getAllOrgPlans = async (req, res) => {
    try {
        const plans = await OrganizationPlan.find({ isActive: true })
            .populate('organization', 'name email plan')
            .sort({ createdAt: -1 });

        const plansWithDetails = plans.map(plan => ({
            ...plan.toObject(),
            planDuration: getPlanDuration(plan.planName),
            daysRemaining: Math.ceil((new Date(plan.endDate) - new Date()) / (1000 * 60 * 60 * 24))
        }));

        res.json({
            success: true,
            plans: plansWithDetails,
            totalCount: plans.length
        });
    } catch (error) {
        console.error('Get all org plans error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// 2b. Org Admin pending-approvals count (for sidebar badges)
export const getOrgApprovalCounts = async (req, res) => {
    const { organizationId, requesterId } = req.query;

    if (!organizationId || !requesterId) {
        return res.status(400).json({ success: false, message: 'Missing organizationId or requesterId' });
    }

    try {
        const requester = await User.findById(requesterId).select('_id role organization isBlocked');
        if (!requester || requester.isBlocked || requester.role !== 'org_admin') {
            return res.status(403).json({ success: false, message: 'Unauthorized org_admin' });
        }
        if (String(requester.organization) !== String(organizationId)) {
            return res.status(403).json({ success: false, message: 'Requester does not belong to this organization' });
        }

        const [pendingOrgCourses, pendingAiCourses, pendingLimitRequests] = await Promise.all([
            OrgCourse.countDocuments({ organizationId, approvalStatus: 'pending' }),
            Course.countDocuments({ organizationId, approvalStatus: 'pending' }),
            DeptCourseLimitRequest.countDocuments({ organizationId, status: 'pending' })
        ]);

        const pendingCourseApprovals = pendingOrgCourses + pendingAiCourses;
        const totalPending = pendingCourseApprovals + pendingLimitRequests;

        res.json({
            success: true,
            counts: {
                pendingCourseApprovals,
                pendingLimitRequests,
                totalPending
            }
        });
    } catch (error) {
        console.error('getOrgApprovalCounts error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const formatOrgPlanLabel = (planName) => {
    if (planName === '1months') return '1 Month';
    if (planName === '3months') return '3 Months';
    if (planName === '6months') return '6 Months';
    return planName || 'Custom Plan';
};

const sendOrgPlanReminderMail = async (plan) => {
    const organizationName = plan.organization?.name || 'Organization';
    const adminEmail = plan.organization?.email || '';
    const recipients = [adminEmail, plan.paidByEmail].filter(Boolean);
    const uniqueRecipients = [...new Set(recipients)];

    if (uniqueRecipients.length === 0) {
        return { success: false, reason: 'No recipient email is available for this organization' };
    }

    const daysRemaining = Math.ceil((new Date(plan.endDate) - new Date()) / (1000 * 60 * 60 * 24));

    await sendMail({
        to: uniqueRecipients.join(','),
        subject: `${organizationName} plan reminder`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
                <h2 style="margin-bottom: 12px;">Plan renewal reminder</h2>
                <p>Your organization plan for <strong>${organizationName}</strong> is approaching expiry.</p>
                <table style="border-collapse: collapse; margin: 16px 0;">
                    <tr><td style="padding: 6px 12px 6px 0;"><strong>Plan</strong></td><td>${formatOrgPlanLabel(plan.planName)}</td></tr>
                    <tr><td style="padding: 6px 12px 6px 0;"><strong>Payment status</strong></td><td>${plan.paymentStatus || 'pending'}</td></tr>
                    <tr><td style="padding: 6px 12px 6px 0;"><strong>Payment mode</strong></td><td>${plan.paymentMode || 'online'}</td></tr>
                    <tr><td style="padding: 6px 12px 6px 0;"><strong>Plan end date</strong></td><td>${plan.endDate ? new Date(plan.endDate).toLocaleDateString() : 'N/A'}</td></tr>
                    <tr><td style="padding: 6px 12px 6px 0;"><strong>Days remaining</strong></td><td>${daysRemaining}</td></tr>
                    <tr><td style="padding: 6px 12px 6px 0;"><strong>Tracked amount</strong></td><td>INR ${plan.totalPrice || 0}</td></tr>
                </table>
                <p>Please review the renewal and payment status to avoid interruption for institutional access.</p>
            </div>
        `
    });

    plan.metadata = {
        ...(plan.metadata || {}),
        reminderLastSentAt: new Date()
    };
    await plan.save();

    return { success: true };
};

/**
 * SEND ORGANIZATION PLAN EXPIRY REMINDER (ADMIN)
 */
export const sendOrgPlanReminder = async (req, res) => {
    const { organizationId } = req.params;

    try {
        const plan = await OrganizationPlan.findOne({ organization: organizationId, isActive: true })
            .populate('organization', 'name email');

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Active organization plan not found'
            });
        }

        const result = await sendOrgPlanReminderMail(plan);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.reason
            });
        }

        res.json({
            success: true,
            message: 'Reminder sent successfully'
        });
    } catch (error) {
        console.error('Send org plan reminder error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * SEND BULK ORGANIZATION PLAN REMINDERS (ADMIN)
 */
export const sendBulkOrgPlanReminders = async (req, res) => {
    const { organizationIds = [], lifecycle = 'expiring-soon' } = req.body || {};

    try {
        const plans = await OrganizationPlan.find({ isActive: true })
            .populate('organization', 'name email')
            .sort({ endDate: 1 });

        const now = new Date();
        const lifecycleMatchedPlans = plans.filter((plan) => {
            if (!plan.endDate) return false;

            const diffDays = Math.ceil((new Date(plan.endDate) - now) / (1000 * 60 * 60 * 24));
            if (lifecycle === 'expired') return diffDays < 0;
            if (lifecycle === 'all') return diffDays <= 15;
            return diffDays >= 0 && diffDays <= 15;
        });

        const targetPlans = organizationIds.length
            ? lifecycleMatchedPlans.filter((plan) => organizationIds.includes(String(plan.organization?._id || plan.organization)))
            : lifecycleMatchedPlans;

        if (!targetPlans.length) {
            return res.status(404).json({
                success: false,
                message: 'No matching organization plans found for reminder sending'
            });
        }

        const sent = [];
        const failed = [];

        for (const plan of targetPlans) {
            try {
                const result = await sendOrgPlanReminderMail(plan);
                if (result.success) {
                    sent.push({
                        organizationId: String(plan.organization?._id || plan.organization),
                        organizationName: plan.organization?.name || 'Organization'
                    });
                } else {
                    failed.push({
                        organizationId: String(plan.organization?._id || plan.organization),
                        organizationName: plan.organization?.name || 'Organization',
                        reason: result.reason
                    });
                }
            } catch (error) {
                failed.push({
                    organizationId: String(plan.organization?._id || plan.organization),
                    organizationName: plan.organization?.name || 'Organization',
                    reason: error.message || 'Reminder sending failed'
                });
            }
        }

        res.json({
            success: true,
            message: `Reminder process completed. Sent: ${sent.length}, Failed: ${failed.length}`,
            sent,
            failed
        });
    } catch (error) {
        console.error('Bulk org plan reminder error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * UPDATE ORGANIZATION PLAN FEATURES (ADMIN)
 */
export const updateOrgPlanFeatures = async (req, res) => {
    const { organizationId } = req.params;
    const { features } = req.body;

    try {
        const plan = await OrganizationPlan.findOne({ organization: organizationId });

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Plan not found for this organization'
            });
        }

        // Update features
        plan.features = {
            ...plan.features,
            ...features
        };

        await plan.save();

        res.json({
            success: true,
            message: 'Plan features updated successfully',
            plan: plan.toObject()
        });
    } catch (error) {
        console.error('Update org plan features error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * DELETE ORGANIZATION PLAN (ADMIN)
 */
export const deleteOrgPlan = async (req, res) => {
    const { organizationId } = req.params;

    try {
        const plan = await OrganizationPlan.findOneAndUpdate(
            { organization: organizationId },
            { isActive: false },
            { new: true }
        );

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Plan not found for this organization'
            });
        }

        res.json({
            success: true,
            message: 'Organization plan deactivated successfully'
        });
    } catch (error) {
        console.error('Delete org plan error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
