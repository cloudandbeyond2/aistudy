import mongoose from 'mongoose';

const loginActivitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
  role: { type: String, default: 'user' },
  activityType: { type: String, default: 'login' },
  email: { type: String, default: '' },
  name: { type: String, default: '' },
  ipAddress: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

loginActivitySchema.index({ organization: 1, createdAt: -1 });
loginActivitySchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('LoginActivity', loginActivitySchema);
