import Resume from '../models/Resume.js';
import IssuedCertificate from '../models/IssuedCertificate.js';
import User from '../models/User.js';

const PAID_TYPES = ['monthly', 'yearly', 'forever'];

// GET /api/resume/:userId  — public, for share link
export const getResume = async (req, res) => {
    try {
        const { userId } = req.params;
        const resume = await Resume.findOne({ userId });
        if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });

        // Fetch user info
        const user = await User.findById(userId).select('mName email profession country city');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Fetch all certifications issued to this user
        const allCerts = await IssuedCertificate.find({ user: userId.toString() });

        // Filter by selected IDs
        const certifications = resume.selectedCertificateIds.length > 0
            ? allCerts.filter(c => resume.selectedCertificateIds.includes(c.certificateId))
            : [];

        return res.json({
            success: true,
            resume: {
                ...resume.toObject(),
                userName: user.mName,
                certifications
            }
        });
    } catch (error) {
        console.error('getResume error:', error);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// GET /api/resume/my/:userId  — fetch resume + certs list for builder (paid users only)
export const getMyResume = async (req, res) => {
    try {
        const { userId } = req.params;

        // Auth: userId from session must match
        if (req.headers['x-user-id'] !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        // Subscription check
        const user = await User.findById(userId).select('type role mName email phone country city profession');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (!PAID_TYPES.includes(user.type)) {
            return res.status(403).json({ success: false, message: 'Resume Builder is available for paid users only.' });
        }
        if (user.role === 'student') {
            return res.status(403).json({ success: false, message: 'Resume Builder is not available for students.' });
        }

        let resume = await Resume.findOne({ userId });
        if (!resume) {
            // Return defaults pre-filled from profile
            resume = {
                userId,
                profession: user.profession || '',
                summary: '',
                phone: user.phone || '',
                email: user.email || '',
                location: [user.city, user.country].filter(Boolean).join(', '),
                linkedIn: '',
                github: '',
                website: '',
                skills: [],
                experience: [],
                education: [],
                selectedCertificateIds: []
            };
        }

        // All certs issued to the user (for selection)
        const allCerts = await IssuedCertificate.find({ user: userId.toString() });

        return res.json({
            success: true,
            resume,
            userName: user.mName,
            allCertifications: allCerts
        });
    } catch (error) {
        console.error('getMyResume error:', error);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// POST /api/resume  — create or update resume (paid users only)
export const saveResume = async (req, res) => {
    try {
        const {
            userId,
            profession,
            summary,
            phone,
            email,
            location,
            linkedIn,
            github,
            website,
            skills,
            experience,
            education,
            selectedCertificateIds
        } = req.body;

        if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });

        // Auth check
        if (req.headers['x-user-id'] !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        // Subscription check
        const user = await User.findById(userId).select('type role');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (!PAID_TYPES.includes(user.type)) {
            return res.status(403).json({ success: false, message: 'Resume Builder is available for paid users only.' });
        }
        if (user.role === 'student') {
            return res.status(403).json({ success: false, message: 'Resume Builder is not available for students.' });
        }

        const resume = await Resume.findOneAndUpdate(
            { userId },
            {
                $set: {
                    userId,
                    profession,
                    summary,
                    phone,
                    email,
                    location,
                    linkedIn,
                    github,
                    website,
                    skills: skills || [],
                    experience: experience || [],
                    education: education || [],
                    selectedCertificateIds: selectedCertificateIds || [],
                    updatedAt: new Date()
                }
            },
            { upsert: true, new: true, runValidators: true }
        );

        return res.json({ success: true, resume });
    } catch (error) {
        console.error('saveResume error:', error);
        return res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
};
