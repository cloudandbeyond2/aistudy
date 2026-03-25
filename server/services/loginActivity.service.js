import LoginActivity from '../models/LoginActivity.js';

export const recordLoginActivity = async ({ user, req }) => {
  if (!user?._id) return null;

  return LoginActivity.create({
    user: user._id,
    organization: user.organization || null,
    role: user.role || 'user',
    activityType: 'login',
    email: user.email || '',
    name: user.mName || '',
    ipAddress: req?.headers?.['x-forwarded-for'] || req?.ip || '',
    userAgent: req?.headers?.['user-agent'] || ''
  });
};
