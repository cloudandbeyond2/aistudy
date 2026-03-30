import mongoose from 'mongoose';

const organizationLandingSchema = new mongoose.Schema({
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, unique: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    heroTitle: { type: String, default: 'Welcome to our Learning Portal' },
    heroSubtitle: { type: String, default: 'Empower your future with quality education and placement support.' },
    heroImage: { type: String },
    aboutUs: { type: String },
    primaryColor: { type: String, default: '#3b82f6' }, // Default blue
    secondaryColor: { type: String, default: '#1e3a8a' },
    statistics: {
        studentsCount: { type: Number, default: 0 },
        placementsCount: { type: Number, default: 0 }
    },
    placementCompanies: [{
        name: { type: String },
        logoUrl: { type: String }
    }],
    socialLinks: {
        facebook: String,
        twitter: String,
        linkedin: String,
        instagram: String
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

organizationLandingSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

export default mongoose.model('OrganizationLanding', organizationLandingSchema);
