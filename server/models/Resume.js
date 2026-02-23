import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  company: { type: String, default: '' },
  location: { type: String, default: '' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: 'Present' },
  description: { type: String, default: '' }
}, { _id: false });

const educationSchema = new mongoose.Schema({
  degree: { type: String, default: '' },
  institution: { type: String, default: '' },
  year: { type: String, default: '' },
  grade: { type: String, default: '' }
}, { _id: false });

const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  profession: { type: String, default: '' },
  summary: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  location: { type: String, default: '' },
  linkedIn: { type: String, default: '' },
  github: { type: String, default: '' },
  website: { type: String, default: '' },
  skills: { type: [String], default: [] },
  experience: { type: [experienceSchema], default: [] },
  education: { type: [educationSchema], default: [] },
  selectedCertificateIds: { type: [String], default: [] }, // IssuedCertificate certificateIds
  updatedAt: { type: Date, default: Date.now }
});

resumeSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Resume', resumeSchema);
