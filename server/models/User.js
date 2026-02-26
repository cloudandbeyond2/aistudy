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
  role: { type: String, enum: ['user', 'student', 'org_admin'], default: 'user' },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  phone: { type: String, default: null },
  dob: { type: Date, default: null },
  gender: { type: String, default: null },
  country: { type: String, default: null },
  city: { type: String, default: null },
  state: { type: String, default: null },
  pin: { type: String, default: null },
  address: { type: String, default: null },
  userType: { type: String, enum: ['individual', 'organization'], default: 'individual' },
  profession: { type: String, default: null },
  experienceLevel: { type: String, default: 'beginner' },
  studentDetails: {
    department: String,
    section: String,
    rollNo: String
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
    planDetails: String
  },

  isBlocked: { type: Boolean, default: false },
  notifications: {
    mail: { type: Boolean, default: true },
    payments: { type: Boolean, default: true },
    chat: { type: Boolean, default: true }
  },
  date: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
