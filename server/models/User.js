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
  studentDetails: {
    department: String,
    section: String,
    rollNo: String
  },
  subscriptionStart: { type: Date, default: null },
  subscriptionEnd: { type: Date, default: null },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
  date: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
