import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true }, // For Org Admin login
    address: String,
    contactNumber: String,
    logo: String,
    plan: { type: String, default: 'basic' },
    allowAICreation: { type: Boolean, default: true },
    allowManualCreation: { type: Boolean, default: true },
    isBlocked: { type: Boolean, default: false },
    allowCareerPlacement: { type: Boolean, default: true },
    allowATS: { type: Boolean, default: true },
    studentSlot: { type: Number, default: 1 }, // 1: 50, 2: 100, 3: 150, 4: 200
    customStudentLimit: { type: Number, default: 0 }, // If > 0, overrides studentSlot
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Organization', organizationSchema);
