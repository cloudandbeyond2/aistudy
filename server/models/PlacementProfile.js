import mongoose from 'mongoose';

const placementProfileSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        default: null
    },
    // Profile links
    githubUrl: { type: String, default: '' },
    linkedinUrl: { type: String, default: '' },
    portfolioUrl: { type: String, default: '' },
    // Job preferences
    jobPreferences: { type: String, default: '' },
    skills: { type: [String], default: [] },
    // Metrics (computed/cached)
    resumeComplete: { type: Boolean, default: false },
    projectsCount: { type: Number, default: 0 },
    certificatesCount: { type: Number, default: 0 },
    // Placement readiness score 0-100
    placementScore: { type: Number, default: 0 },
    // Status
    isAvailableForPlacement: { type: Boolean, default: false },
    updatedAt: { type: Date, default: Date.now }
});

placementProfileSchema.index({ studentId: 1, organizationId: 1 }, { unique: true });

placementProfileSchema.pre('save', function () {
    this.updatedAt = new Date();
});

export default mongoose.model('PlacementProfile', placementProfileSchema);
