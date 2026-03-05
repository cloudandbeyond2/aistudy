import PlacementProfile from '../models/PlacementProfile.js';
import Project from '../models/Project.js';
import Resume from '../models/Resume.js';
import IssuedCertificate from '../models/IssuedCertificate.js';
import User from '../models/User.js';
import Organization from '../models/Organization.js';

/**
 * Calculate placement score based on student activity
 * Score breakdown (0-100):
 *   +30 if resume exists & is non-empty
 *   +30 for projects (10 per project, max 3)
 *   +20 for certificates (10 per cert, max 2)
 *   +10 if github linked
 *   +10 if linkedin linked
 */
const computeScore = ({ resumeComplete, projectsCount, certificatesCount, githubUrl, linkedinUrl }) => {
    let score = 0;
    if (resumeComplete) score += 30;
    score += Math.min(projectsCount * 10, 30);
    score += Math.min(certificatesCount * 10, 20);
    if (githubUrl) score += 10;
    if (linkedinUrl) score += 10;
    return Math.min(score, 100);
};

/**
 * GET /api/org/placement-stats?organizationId=...
 * Org admin sees all student placement profiles
 */
export const getOrgPlacementStats = async (req, res) => {
    const { organizationId } = req.query;
    try {
        const students = await User.find({ organization: organizationId, role: 'student' })
            .select('mName email studentDetails department');

        const profiles = await PlacementProfile.find({ organizationId });
        const profileMap = {};
        profiles.forEach(p => { profileMap[p.studentId.toString()] = p; });

        const data = students.map(s => {
            const profile = profileMap[s._id.toString()] || null;
            return {
                studentId: s._id,
                name: s.mName,
                email: s.email,
                department: s.department,
                rollNo: s.studentDetails?.rollNo,
                placementScore: profile?.placementScore || 0,
                resumeComplete: profile?.resumeComplete || false,
                projectsCount: profile?.projectsCount || 0,
                certificatesCount: profile?.certificatesCount || 0,
                githubUrl: profile?.githubUrl || '',
                linkedinUrl: profile?.linkedinUrl || '',
                portfolioUrl: profile?.portfolioUrl || '',
                isAvailableForPlacement: profile?.isAvailableForPlacement || false,
                skills: profile?.skills || [],
                jobPreferences: profile?.jobPreferences || ''
            };
        });

        // Stats summary
        const totalStudents = data.length;
        const readyCount = data.filter(d => d.placementScore >= 60).length;
        const avgScore = totalStudents > 0
            ? Math.round(data.reduce((sum, d) => sum + d.placementScore, 0) / totalStudents)
            : 0;

        res.json({
            success: true,
            students: data,
            stats: { totalStudents, readyCount, avgScore }
        });
    } catch (error) {
        console.error('getOrgPlacementStats error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * GET /api/career/profile/:studentId?organizationId=...
 * Student fetches their own placement profile
 */
export const getStudentPlacementProfile = async (req, res) => {
    const { studentId } = req.params;
    const { organizationId } = req.query;
    try {
        // Compute live metrics
        const [resume, projects, certs] = await Promise.all([
            Resume.findOne({ userId: studentId }),
            Project.find({ studentId, organizationId, type: 'Showcase' }),
            IssuedCertificate.find({ user: studentId.toString() })
        ]);

        const resumeComplete = !!(
            resume &&
            (resume.summary || resume.experience?.length > 0 || resume.education?.length > 0)
        );
        const projectsCount = projects.length;
        const certificatesCount = certs.length;

        let profile = await PlacementProfile.findOne({ studentId, organizationId });

        if (!profile) {
            // Create a default profile
            profile = new PlacementProfile({
                studentId,
                organizationId,
                resumeComplete,
                projectsCount,
                certificatesCount,
                placementScore: computeScore({ resumeComplete, projectsCount, certificatesCount, githubUrl: '', linkedinUrl: '' })
            });
            await profile.save();
        } else {
            // Update computed fields
            profile.resumeComplete = resumeComplete;
            profile.projectsCount = projectsCount;
            profile.certificatesCount = certificatesCount;
            profile.placementScore = computeScore({
                resumeComplete,
                projectsCount,
                certificatesCount,
                githubUrl: profile.githubUrl,
                linkedinUrl: profile.linkedinUrl
            });
            await profile.save();
        }

        res.json({
            success: true,
            profile,
            certifications: certs,
            projects,
            hasResume: !!resume
        });
    } catch (error) {
        console.error('getStudentPlacementProfile error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * POST /api/career/profile
 * Student creates/updates their placement profile (links, skills, preferences)
 */
export const upsertPlacementProfile = async (req, res) => {
    const {
        studentId,
        organizationId,
        githubUrl,
        linkedinUrl,
        portfolioUrl,
        skills,
        jobPreferences,
        isAvailableForPlacement
    } = req.body;

    try {
        // Gather metrics
        const [resume, projects, certs] = await Promise.all([
            Resume.findOne({ userId: studentId }),
            Project.find({ studentId, organizationId, type: 'Showcase' }),
            IssuedCertificate.find({ user: studentId.toString() })
        ]);

        const resumeComplete = !!(
            resume &&
            (resume.summary || resume.experience?.length > 0 || resume.education?.length > 0)
        );
        const projectsCount = projects.length;
        const certificatesCount = certs.length;
        const placementScore = computeScore({ resumeComplete, projectsCount, certificatesCount, githubUrl, linkedinUrl });

        const profile = await PlacementProfile.findOneAndUpdate(
            { studentId, organizationId },
            {
                $set: {
                    studentId,
                    organizationId,
                    githubUrl: githubUrl || '',
                    linkedinUrl: linkedinUrl || '',
                    portfolioUrl: portfolioUrl || '',
                    skills: skills || [],
                    jobPreferences: jobPreferences || '',
                    isAvailableForPlacement: !!isAvailableForPlacement,
                    resumeComplete,
                    projectsCount,
                    certificatesCount,
                    placementScore,
                    updatedAt: new Date()
                }
            },
            { upsert: true, new: true, runValidators: true }
        );

        res.json({ success: true, profile });
    } catch (error) {
        console.error('upsertPlacementProfile error:', error);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

/**
 * POST /api/career/project
 * Student submits a showcase project
 */
export const submitStudentProject = async (req, res) => {
    const { studentId, organizationId, title, description, githubUrl, liveUrl, techStack, image } = req.body;
    try {
        const project = await Project.create({
            studentId,
            organizationId,
            title,
            description,
            type: 'Showcase',
            githubUrl: githubUrl || '',
            liveUrl: liveUrl || '',
            techStack: Array.isArray(techStack) ? techStack : (techStack ? techStack.split(',').map(t => t.trim()) : []),
            image: image || '',
            status: 'approved',
            isPublic: true
        });
        res.json({ success: true, project });
    } catch (error) {
        console.error('submitStudentProject error:', error);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

/**
 * GET /api/career/projects?organizationId=...&studentId=...
 * Fetch projects — for student (own) or org admin (all showcase)
 */
export const getStudentProjects = async (req, res) => {
    const { organizationId, studentId } = req.query;
    try {
        const query = { organizationId, type: 'Showcase' };
        if (studentId) query.studentId = studentId;

        const projects = await Project.find(query)
            .populate('studentId', 'mName email')
            .sort({ createdAt: -1 });
        res.json({ success: true, projects });
    } catch (error) {
        console.error('getStudentProjects error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * DELETE /api/career/project/:id
 * Remove a showcase project
 */
export const deleteStudentProject = async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Project deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * GET /api/org/certificates?organizationId=...
 * Org admin: get all verified certificates for org students
 */
export const getOrgVerifiedCerts = async (req, res) => {
    const { organizationId } = req.query;
    try {
        const students = await User.find({ organization: organizationId, role: 'student' }).select('_id mName');
        const studentIds = students.map(s => s._id.toString());
        const studentMap = {};
        students.forEach(s => { studentMap[s._id.toString()] = s.mName; });

        const certs = await IssuedCertificate.find({ user: { $in: studentIds } }).sort({ date: -1 });

        const certsWithNames = certs.map(c => ({
            ...c.toObject(),
            studentName: studentMap[c.user] || c.studentName || 'Unknown'
        }));

        res.json({ success: true, certificates: certsWithNames, total: certs.length });
    } catch (error) {
        console.error('getOrgVerifiedCerts error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * GET /api/career/public-portfolio/:studentId
 * Public portfolio data (no auth required)
 */
export const getPublicPortfolio = async (req, res) => {
    const { studentId } = req.params;
    try {
        const [user, resume, profile, projects, certs] = await Promise.all([
            User.findById(studentId).select('mName email profession country city organization'),
            Resume.findOne({ userId: studentId }),
            PlacementProfile.findOne({ studentId }),
            Project.find({ studentId, type: 'Showcase', isPublic: true }).sort({ createdAt: -1 }),
            IssuedCertificate.find({ user: studentId.toString() }).sort({ date: -1 })
        ]);

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Check if org allows career placement public visibility
        if (user.organization) {
            const org = await Organization.findById(user.organization).select('allowCareerPlacement name');
            if (org && !org.allowCareerPlacement) {
                return res.status(403).json({ success: false, message: 'Portfolio not available' });
            }
        }

        res.json({
            success: true,
            user: {
                name: user.mName,
                email: user.email,
                profession: user.profession || (profile ? profile.jobPreferences : ''),
                country: user.country,
                city: user.city
            },
            resume,
            profile,
            projects,
            certifications: certs
        });
    } catch (error) {
        console.error('getPublicPortfolio error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
