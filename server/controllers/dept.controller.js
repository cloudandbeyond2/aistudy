import User from '../models/User.js';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import OrgCourse from '../models/OrgCourse.js';
import Course from '../models/Course.js';
import StudentProgress from '../models/StudentProgress.js';
import Department from '../models/Department.js';

export const getDeptDashboardStats = async (req, res) => {
    const { departmentId } = req.query;
    try {
        const department = await Department.findById(departmentId).select('name');
        const deptName = department ? department.name : 'Unknown Department';

        const studentCount = await User.countDocuments({ department: departmentId, role: 'student' });

        // Count assignments for this department
        const assignments = await Assignment.find({ department: departmentId }).select('_id');
        const assignmentCount = assignments.length;
        const assignmentIds = assignments.map(a => a._id);

        const submissionCount = await Submission.countDocuments({ assignmentId: { $in: assignmentIds } });

        // Course Stats
        const orgCoursesCount = await OrgCourse.countDocuments({ department: departmentId });
        const aiCoursesCount = await Course.countDocuments({ department: departmentId });
        const totalCoursesCount = orgCoursesCount + aiCoursesCount;

        // Progress
        const students = await User.find({ department: departmentId, role: 'student' }).select('_id');
        const studentIds = students.map(s => s._id);

        const completedCoursesCount = await StudentProgress.countDocuments({
            userId: { $in: studentIds },
            percentage: 100
        });

        res.json({
            success: true,
            deptName,
            studentCount,
            assignmentCount,
            submissionCount,
            totalCoursesCount,
            completedCoursesCount
        });
    } catch (error) {
        console.error('getDeptDashboardStats error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getDeptStudents = async (req, res) => {
    const { departmentId } = req.query;
    try {
        const students = await User.find({ department: departmentId, role: 'student' })
            .select('-password')
            .sort({ createdAt: -1 });
        res.json({ success: true, students });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
