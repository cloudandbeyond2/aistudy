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
  type: String, // free | monthly | yearly | forever
  subscriptionStart: { type: Date, default: null },
  subscriptionEnd: { type: Date, default: null },
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

  date: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
