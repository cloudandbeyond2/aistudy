import Organization from '../models/Organization.js';
import User from '../models/User.js';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import Notice from '../models/Notice.js';
import OrgCourse from '../models/OrgCourse.js';
import Course from '../models/Course.js';
import bcrypt from 'bcrypt';
import Meeting from '../models/Meeting.js';
import Project from '../models/Project.js';
import Material from '../models/Material.js';
import StudentProgress from '../models/StudentProgress.js';
// import { generateAssignments } from './ai.controller.js'; // Will implement this export next

/**
 * ORGANIZATION SIGNUP
 */
export const orgSignup = async (req, res) => {
    const { name, email, password, address, contactNumber, allowAICreation, allowManualCreation } = req.body;

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
        const newOrg = new Organization({
            name,
            email,
            password: hashedPassword,
            address,
            contactNumber,
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
            type: 'forever',
            organization: newOrg._id,
            isEmailVerified: true,
            isOrganization: true
        });
        await adminUser.save();

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
 * ADD STUDENT (Single)
 */
export const addStudent = async (req, res) => {
    const { email, name, phone, password, department, section, rollNo, organizationId } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.json({ success: false, message: 'User with this email already exists' });
        }

        user = new User({
            email,
            mName: name,
            phone,
            password,
            role: 'student',
            organization: organizationId,
            studentDetails: { department, section, rollNo },
            isVerified: true
        });

        await user.save();
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
    const { name, email, department, section, rollNo } = req.body;

    try {
        const updates = {
            mName: name,
            email,
            'studentDetails.department': department,
            'studentDetails.section': section,
            'studentDetails.rollNo': rollNo,
            updatedAt: Date.now()
        };

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
        let addedCount = 0;
        const errors = [];

        for (const student of students) {
            const { email, name, password, department, section, rollNo } = student;

            const existing = await User.findOne({ email });
            if (existing) {
                errors.push(`Email ${email} already exists`);
                continue;
            }

            await new User({
                email,
                mName: name,
                password,
                role: 'student',
                organization: organizationId,
                studentDetails: { department, section, rollNo }
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

        res.json({ success: true, studentCount, assignmentCount, submissionCount });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * CREATE ASSIGNMENT
 */
export const createAssignment = async (req, res) => {
    const { organizationId, topic, description, dueDate, department, questions } = req.body;
    try {
        const assignment = new Assignment({
            organizationId,
            topic,
            description,
            dueDate,
            department,
            questions
        });
        await assignment.save();
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
                const department = student.studentDetails?.department;
                query.$or = [
                    { assignedTo: studentId },
                    { department: department },
                    {
                        $and: [
                            { assignedTo: { $size: 0 } },
                            { $or: [{ department: { $exists: false } }, { department: '' }, { department: 'all' }] }
                        ]
                    }
                ];
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
    const { organizationId, title, content, audience } = req.body;

    try {
        const notice = new Notice({ organizationId, title, content, audience });
        await notice.save();
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
                const department = student.studentDetails?.department;
                query.$or = [
                    { audience: department },
                    { audience: 'all' },
                    { audience: { $exists: false } },
                    { audience: '' }
                ];
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
    const { organizationId, title, description, type, department, topics, quizzes, assignedTo, createdBy } = req.body;
    try {
        const course = new OrgCourse({
            organizationId,
            title,
            description,
            type: type || 'video & text course',
            department,
            topics: topics || [],
            quizzes: quizzes || [],
            assignedTo: assignedTo || [], // Specific students or empty for all
            createdBy
        });
        await course.save();
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
        const meeting = new Meeting({ organizationId, title, link, platform, date, time, department });
        await meeting.save();
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
                const department = student.studentDetails?.department;
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
    const { organizationId, title, description, type, department, dueDate } = req.body;
    try {
        const project = new Project({ organizationId, title, description, type, department, dueDate });
        await project.save();
        res.json({ success: true, message: 'Project created', project });
    } catch (error) {
        console.error('Create Project Error:', error);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

export const getProjects = async (req, res) => {
    const { organizationId, studentId } = req.query;
    try {
        let query = { organizationId };
        if (studentId) {
            const student = await User.findById(studentId);
            if (student) {
                const department = student.studentDetails?.department;
                query.$or = [{ department: department }, { department: 'all' }, { department: '' }];
            }
        }
        const projects = await Project.find(query).sort({ createdAt: -1 });
        res.json({ success: true, projects });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const deleteProject = async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Project deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * MATERIALS
 */
export const createMaterial = async (req, res) => {
    const { organizationId, title, description, fileUrl, type, department } = req.body;
    try {
        const material = new Material({ organizationId, title, description, fileUrl, type, department });
        await material.save();
        res.json({ success: true, message: 'Material added', material });
    } catch (error) {
        console.error('Create Material Error:', error);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
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
                query.$or = [{ department: department }, { department: 'all' }, { department: '' }];
            }
        }
        const materials = await Material.find(query).sort({ createdAt: -1 });
        res.json({ success: true, materials });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const deleteMaterial = async (req, res) => {
    try {
        await Material.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Material deleted' });
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
