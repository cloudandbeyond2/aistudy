import mongoose from 'mongoose';

const globalSettingsSchema = new mongoose.Schema({
  interviewModule: {
    isEnabled: { type: Boolean, default: true },
    dailyMockLimitFree: { type: Number, default: 2 },
    dailyMockLimitPremium: { type: Number, default: 10 },
    allowedRoles: [{ type: String, default: ['user', 'student', 'org_admin', 'dept_admin'] }]
  },
  aiSettings: {
    defaultModel: { type: String, default: 'gemini-2.0-flash' },
    enableVoice: { type: Boolean, default: true }
  },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('GlobalSettings', globalSettingsSchema);
