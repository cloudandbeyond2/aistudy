import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  mName: String,
  type: { type: String, required: true },
  total: { type: Number, default: 0 },
  terms: { type: String, default: '' },
  privacy: { type: String, default: '' },
  cookies: { type: String, default: '' },
  cancel: { type: String, default: '' },
  refund: { type: String, default: '' },
  billing: { type: String, default: '' },
  aiProvider: { type: String, enum: ['gemini', 'openai'], default: 'gemini' },
  geminiApiKey: { type: String, default: '' },
  geminiModel: { type: String, default: 'gemini-2.5-flash' },
  openaiApiKey: { type: String, default: '' },
  openaiModel: { type: String, default: 'gpt-4.1-mini' },
  unsplashApiKey: { type: String, default: '' },
  websiteName: { type: String, default: 'Colossus IQ' },
  websiteLogo: { type: String, default: '/logo.png' },
  taxPercentage: { type: Number, default: 0 },
  notebookEnabled: {
    free: { type: Boolean, default: false },
    monthly: { type: Boolean, default: true },
    yearly: { type: Boolean, default: true },
    forever: { type: Boolean, default: true },
    org_admin: { type: Boolean, default: true },
    student: { type: Boolean, default: false }
  },
  resumeEnabled: {
    free: { type: Boolean, default: false },
    monthly: { type: Boolean, default: true },
    yearly: { type: Boolean, default: true },
    forever: { type: Boolean, default: true },
    org_admin: { type: Boolean, default: true },
    student: { type: Boolean, default: false }
  },
  careerEnabled: {
    free: { type: Boolean, default: false },
    monthly: { type: Boolean, default: true },
    yearly: { type: Boolean, default: true },
    forever: { type: Boolean, default: true },
    org_admin: { type: Boolean, default: true },
    student: { type: Boolean, default: true }
  },
  interviewEnabled: {
    free: { type: Boolean, default: false },
    monthly: { type: Boolean, default: true },
    yearly: { type: Boolean, default: true },
    forever: { type: Boolean, default: true },
    org_admin: { type: Boolean, default: true },
    student: { type: Boolean, default: false }
  },
  skillBoosterEnabled: {
    free: { type: Boolean, default: false },
    monthly: { type: Boolean, default: true },
    yearly: { type: Boolean, default: true },
    forever: { type: Boolean, default: true },
    org_admin: { type: Boolean, default: true },
    student: { type: Boolean, default: true }
  },
  communicationPracticeEnabled: {
    free: { type: Boolean, default: false },
    monthly: { type: Boolean, default: true },
    yearly: { type: Boolean, default: true },
    forever: { type: Boolean, default: true },
    org_admin: { type: Boolean, default: true },
    student: { type: Boolean, default: true }
  },
  digitalIdEnabled: {
    free: { type: Boolean, default: false },
    monthly: { type: Boolean, default: true },
    yearly: { type: Boolean, default: true },
    forever: { type: Boolean, default: true },
    org_admin: { type: Boolean, default: true },
    student: { type: Boolean, default: false }
  }
});

export default mongoose.model('Admin', adminSchema);
