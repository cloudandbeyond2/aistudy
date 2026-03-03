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
  geminiApiKey: { type: String, default: '' },
  unsplashApiKey: { type: String, default: '' },
  websiteName: { type: String, default: 'AIstudy' },
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
  }
});

export default mongoose.model('Admin', adminSchema);
