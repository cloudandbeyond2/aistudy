import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
  course: String,
  userId: String, // ID of the student who took the exam
  exam: String,
  marks: String,
  passed: { type: Boolean, default: false },
  date: { type: Date, default: Date.now }
});

export default mongoose.model('Exam', examSchema);
