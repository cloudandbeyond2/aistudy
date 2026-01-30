import mongoose from 'mongoose';

const issuedCertificateSchema = new mongoose.Schema({
  certificateId: { type: String, unique: true, required: true },
  user: { type: String, required: true },   // User ID
  course: { type: String, required: true }, // Course ID
  studentName: String,
  courseName: String,
  date: { type: Date, default: Date.now }
});

export default mongoose.model(
  'IssuedCertificate',
  issuedCertificateSchema
);
