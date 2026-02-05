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
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Organization', organizationSchema);
