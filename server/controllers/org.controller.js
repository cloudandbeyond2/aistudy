import Organization from '../models/Organization.js';
import User from '../models/User.js';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import Notice from '../models/Notice.js';
import OrgCourse from '../models/OrgCourse.js';
import Course from '../models/Course.js';
import OrganizationPlan from '../models/OrganizationPlan.js';
import bcrypt from 'bcrypt';
import Meeting from '../models/Meeting.js';
import Department from '../models/Department.js';
import StudentProgress from '../models/StudentProgress.js';
import LimitRequest from '../models/LimitRequest.js';
import ProjectModel from '../models/Project.js';
import MaterialModel from '../models/Material.js';
import { createNotification } from './notification.controller.js';
import { getChatModel } from '../config/genai.js';
import { sendMail } from '../services/mail.service.js';
import { getOrgPlanDurationDays, getUserAccessFromOrgPlan } from '../utils/orgPlanAccess.js';
// import { generateAssignments } from './ai.controller.js'; // Will implement this export next

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
        1: 20,
        2: 40,
        3: 60,
        4: 80
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
    const { students, organizationId } = req.body; // Expects array of student objects

    if (!Array.isArray(students)) {
        return res.status(400).json({ success: false, message: 'Invalid data format' });
    }

    try {
        // --- STUDENT LIMIT CHECK ---
        const limit = await getOrgStudentLimit(organizationId);
        const currentCount = await User.countDocuments({ organization: organizationId, role: 'student' });

        if (currentCount >= limit) {
            return res.json({ 
                success: false, 
                message: `Student limit reached (${limit}). Bulk upload aborted.`,
                limitReached: true 
            });
        }

        const remainingSlots = limit - currentCount;
        const studentsToProcess = students.slice(0, remainingSlots);
        const droppedCount = students.length - studentsToProcess.length;

        let addedCount = 0;
        const errors = [];

        if (droppedCount > 0) {
            errors.push(`${droppedCount} students were skipped because the organization limit (${limit}) was reached.`);
        }

        for (const student of studentsToProcess) {
            const { email, name, password, department, section, rollNo, studentClass, academicYear } = student;

            // Simple validation: skip rows with no email and no name
            if (!email && !name) continue;

            // If only name is provided but no email, we can't create a user
            if (!email) {
                errors.push(`Row for ${name || 'unknown'} skipped because email is missing`);
                continue;
            }

            const existing = await User.findOne({ email });
            if (existing) {
                errors.push(`Email ${email} already exists`);
                continue;
            }

            const hashedPassword = await bcrypt.hash(password || '123456', 10);

            await new User({
                email,
                mName: name || 'Student',
                password: hashedPassword,
                role: 'student',
                organization: organizationId,
                department: department && department !== 'all' ? department : null,
                studentDetails: { section, rollNo, studentClass, academicYear },
                isVerified: true
            }).save();

            addedCount++;
        }

        res.json({ success: true, message: `Added ${addedCount} students`, errors });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
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
    const { organizationId, title, description, type, department, topics, quizzes, quizSettings, assignedTo, createdBy } = req.body;
    try {
        // Enforce course limit for dept_admin
        if (createdBy) {
            const creator = await User.findById(createdBy);
            if (creator && creator.role === 'dept_admin') {
                if (creator.coursesCreatedCount >= creator.courseLimit) {
                    return res.status(403).json({
                        success: false,
                        message: `Course creation limit reached (${creator.courseLimit}). Please contact your organization administrator.`
                    });
                }
            }
        }

        const parsedDepartment = department && department !== 'all' ? department : undefined;
        const course = new OrgCourse({
            organizationId,
            title,
            description,
            type: type || 'video & text course',
            department: parsedDepartment,
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

        const department = student.studentDetails?.department;
        console.log('Fetching courses for student:', { studentId, department, organizationId });

        // Get courses assigned to this student, or this department, or all students (empty assignedTo and department)
        const orgCourses = await OrgCourse.find({
            organizationId,
            $or: [
                { assignedTo: studentId }, // Specifically assigned to this student
                { department: department }, // Assigned to their department
                {
                    $and: [
                        { assignedTo: { $size: 0 } },
                        { $or: [{ department: { $exists: false } }, { department: '' }, { department: 'all' }] }
                    ]
                } // Assigned to all
            ]
        }).sort({ createdAt: -1 });

        // Also fetch AI generated courses with same department filtering logic
        const aiCourses = await Course.find({
            organizationId,
            $or: [
                { department: department }, // Assigned to their department
                { $or: [{ department: { $exists: false } }, { department: '' }, { department: null }] } // No department specified (available to all)
            ]
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
    const updates = req.body;
    console.log('Update course request:', { courseId, updates });
    try {
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

export const getDeptAdmins = async (req, res) => {
    const { organizationId, departmentId } = req.query;
    try {
        let query = { organization: organizationId, role: 'dept_admin' };
        if (departmentId) query.department = departmentId;

        const admins = await User.find(query)
            .populate('department', 'name')
            .select('-password')
            .sort({ createdAt: -1 });

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
    const { organizationId, adminId, requestedSlot, requestedCustomLimit } = req.body;

    if (!organizationId || !adminId) {
        return res.status(400).json({ success: false, message: 'Missing organizationId or adminId' });
    }

    try {
        const newRequest = new LimitRequest({
            organizationId,
            adminId,
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
 * HELPER: GET PLAN DURATION IN DAYS
 */
function getPlanDuration(planName) {
    return getOrgPlanDurationDays(planName) || 30;
}

/**
 * CREATE OR UPDATE ORGANIZATION PLAN (ADMIN)
 */
export const createOrgPlan = async (req, res) => {
    const { organizationId, planName, additionalRequestSlots, studentSlotPrice } = req.body;

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
