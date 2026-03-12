import User from '../models/User.js';
import Organization from '../models/Organization.js';
import Course from '../models/Course.js';
import OrgCourse from '../models/OrgCourse.js';
import PlacementProfile from '../models/PlacementProfile.js';
import Resume from '../models/Resume.js';
import IssuedCertificate from '../models/IssuedCertificate.js';
import Department from '../models/Department.js';

/**
 * GET /api/admin/reports/overall
 * Super Admin: Overall KPI report across all organizations
 */
export const getOverallAdminReport = async (req, res) => {
    try {
        const [
            totalUsers,
            totalStudents,
            totalOrganizations,
            totalCourses,
            totalOrgCourses,
            placementProfiles
        ] = await Promise.all([
            User.countDocuments({}),
            User.countDocuments({ role: 'student' }),
            User.countDocuments({ isOrganization: true }),
            Course.countDocuments({}),
            OrgCourse.countDocuments({}),
            PlacementProfile.find({})
        ]);

        const placementReady = placementProfiles.filter(p => p.placementScore >= 60).length;
        const avgPlacementScore = placementProfiles.length > 0
            ? Math.round(placementProfiles.reduce((sum, p) => sum + p.placementScore, 0) / placementProfiles.length)
            : 0;

        // Per-organization breakdown
        const orgUsers = await User.find({ isOrganization: true })
            .select('_id mName email organization organizationDetails');

        const orgBreakdown = await Promise.all(orgUsers.map(async (org) => {
            const orgId = org.organization;
            const students = await User.countDocuments({ organization: orgId, role: 'student' });
            const courses = await OrgCourse.countDocuments({ organizationId: orgId });
            const profiles = await PlacementProfile.find({ organizationId: orgId });
            const ready = profiles.filter(p => p.placementScore >= 60).length;
            const avgScore = profiles.length > 0
                ? Math.round(profiles.reduce((s, p) => s + p.placementScore, 0) / profiles.length)
                : 0;

            return {
                organizationId: orgId,
                institutionName: org.organizationDetails?.institutionName || org.mName,
                email: org.email,
                totalStudents: students,
                totalCourses: courses,
                placementReady: ready,
                avgPlacementScore: avgScore
            };
        }));

        res.json({
            success: true,
            summary: {
                totalUsers,
                totalStudents,
                totalOrganizations,
                totalCourses: totalCourses + totalOrgCourses,
                placementReady,
                avgPlacementScore
            },
            organizations: orgBreakdown
        });
    } catch (error) {
        console.error('getOverallAdminReport error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * GET /api/org/reports/students?organizationId=...&academicYear=...&department=...
 * Org Admin: Student report with academic year and department filtering
 */
export const getOrgStudentReport = async (req, res) => {
    const { organizationId, academicYear, department } = req.query;
    if (!organizationId) {
        return res.status(400).json({ success: false, message: 'organizationId is required' });
    }

    try {
        // Build student query
        const studentQuery = { organization: organizationId, role: 'student' };
        if (academicYear) {
            studentQuery['studentDetails.academicYear'] = academicYear;
        }

        const students = await User.find(studentQuery)
            .select('mName email studentDetails department phone gender date')
            .populate('department', 'name');

        // Filter by department name if provided (since department is an ObjectId)
        let filteredStudents = students;
        if (department) {
            filteredStudents = students.filter(s => {
                const deptName = s.department?.name || s.studentDetails?.department || '';
                return deptName.toLowerCase().includes(department.toLowerCase());
            });
        }

        const studentIds = filteredStudents.map(s => s._id);

        // Fetch placement profiles and resumes in parallel
        const [profiles, resumes, certs] = await Promise.all([
            PlacementProfile.find({ organizationId, studentId: { $in: studentIds } }),
            Resume.find({ userId: { $in: studentIds } }).select('userId summary experience education'),
            IssuedCertificate.find({ user: { $in: studentIds.map(id => id.toString()) } })
        ]);

        const profileMap = {};
        profiles.forEach(p => { profileMap[p.studentId.toString()] = p; });

        const resumeMap = {};
        resumes.forEach(r => { resumeMap[r.userId.toString()] = true; });

        const certMap = {};
        certs.forEach(c => {
            if (!certMap[c.user]) certMap[c.user] = 0;
            certMap[c.user]++;
        });

        const studentData = filteredStudents.map(s => {
            const profile = profileMap[s._id.toString()] || null;
            const hasResume = resumeMap[s._id.toString()] || false;
            const certCount = certMap[s._id.toString()] || 0;

            let placementStatus = 'Not Ready';
            const score = profile?.placementScore || 0;
            if (score >= 80) placementStatus = 'Excellent';
            else if (score >= 60) placementStatus = 'Ready';
            else if (score >= 40) placementStatus = 'In Progress';

            return {
                studentId: s._id,
                name: s.mName,
                email: s.email,
                phone: s.phone || '',
                gender: s.gender || '',
                department: s.department?.name || s.studentDetails?.department || '',
                section: s.studentDetails?.section || '',
                rollNo: s.studentDetails?.rollNo || '',
                academicYear: s.studentDetails?.academicYear || '',
                studentClass: s.studentDetails?.studentClass || '',
                joinedDate: s.date,
                // Placement data
                placementScore: score,
                placementStatus,
                hasResume,
                projectsCount: profile?.projectsCount || 0,
                certificatesCount: certCount,
                githubUrl: profile?.githubUrl || '',
                linkedinUrl: profile?.linkedinUrl || '',
                isAvailableForPlacement: profile?.isAvailableForPlacement || false,
                skills: profile?.skills || []
            };
        });

        // Summary stats
        const totalStudents = studentData.length;
        const placementReady = studentData.filter(s => s.placementScore >= 60).length;
        const avgScore = totalStudents > 0
            ? Math.round(studentData.reduce((sum, s) => sum + s.placementScore, 0) / totalStudents)
            : 0;
        const withResume = studentData.filter(s => s.hasResume).length;

        // Get unique academic years for the dropdown
        const allStudents = await User.find({ organization: organizationId, role: 'student' })
            .select('studentDetails.academicYear');
        const academicYears = [...new Set(
            allStudents
                .map(s => s.studentDetails?.academicYear)
                .filter(Boolean)
        )].sort();

        // Get departments for the dropdown
        const departments = await Department.find({ organizationId }).select('name');

        res.json({
            success: true,
            students: studentData,
            stats: {
                totalStudents,
                placementReady,
                avgScore,
                withResume
            },
            filters: {
                academicYears,
                departments: departments.map(d => d.name)
            }
        });
    } catch (error) {
        console.error('getOrgStudentReport error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
