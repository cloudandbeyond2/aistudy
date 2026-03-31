import mongoose from 'mongoose';

const mockInterviewDriveSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  skills: [{ type: String }],
  targetRole: { type: String, required: true },
  experienceLevel: { type: String, enum: ['Entry', 'Mid', 'Senior'], default: 'Entry' },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Created by Org/Dept Admin
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  settings: {
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    personaMood: { type: String, enum: ['Friendly', 'Professional', 'Strict'], default: 'Professional' },
    enableVoice: { type: Boolean, default: true }
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('MockInterviewDrive', mockInterviewDriveSchema);
