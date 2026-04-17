// import mongoose from 'mongoose';

// const userSchema = new mongoose.Schema({
//   email: { type: String, unique: true, required: true },
//   mName: String,
//   password: String,
//   type: String,
//   resetPasswordToken: { type: String, default: null },
//   resetPasswordExpires: { type: Date, default: null },
//   date: { type: Date, default: Date.now }
// });

// export default mongoose.model('User', userSchema);

// models/user.model.js

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  mName: String,
  password: String,
  type: { type: String, default: 'free' }, // free | monthly | yearly | forever
  role: { type: String, enum: ['user', 'student', 'org_admin', 'dept_admin'], default: 'user' },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
  phone: { type: String, default: null },
  dob: { type: Date, default: null },
  gender: { type: String, default: null },
  country: { type: String, default: null },
  city: { type: String, default: null },
  state: { type: String, default: null },
  pin: { type: String, default: null },
  profileImage: { type: String, default: null },
  address: { type: String, default: null },
  userType: { type: String, enum: ['individual', 'organization'], default: 'individual' },
  profession: { type: String, default: null },
  experienceLevel: { type: String, default: 'beginner' },
  courseLimit: { type: Number, default: 0 },
  coursesCreatedCount: { type: Number, default: 0 },
  studentDetails: {
    department: String,
    section: String,
    studentClass: String,
    rollNo: String,
    academicYear: String,
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    placementCompany: { type: String, default: null },
    placementPosition: { type: String, default: null },
    isPlacementClosed: { type: Boolean, default: false },
    isPlacementReady: { type: Boolean, default: false } // For Org Admin to assign mocks
  },
  mockAttempts: {
    count: { type: Number, default: 0 },
    lastResetAt: { type: Date, default: Date.now }
  },
  subscriptionStart: { type: Date, default: null },
  subscriptionEnd: { type: Date, default: null },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String, default: null },
  emailVerificationExpires: { type: Date, default: null },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },

  // Organization Fields
  isOrganization: { type: Boolean, default: false },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // For students belonging to an org
  organizationDetails: {
    institutionName: String,
    logo: String,
    inchargeName: String,
    inchargeEmail: String,
    inchargePhone: String,
    address: String,
    documents: [String],
    isBlocked: { type: Boolean, default: false },
    planDetails: String,
    studentSlot: { type: Number, default: 1 },
    customStudentLimit: { type: Number, default: 0 }
  },

  isBlocked: { type: Boolean, default: false },
  failedAttempts: { type: Number, default: 0 },
  lastLoginAt: { type: Date, default: null },
  loginCount: { type: Number, default: 0 },
  notifications: {
    mail: { type: Boolean, default: true },
    payments: { type: Boolean, default: true },
    chat: { type: Boolean, default: true }
  },
  googleCalendar: {
    connected: { type: Boolean, default: false },
    refreshToken: { type: String, default: null },
    lastSyncAt: { type: Date, default: null }
  },
  date: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
