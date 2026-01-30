import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
  course: String,
  exam: String,
  marks: String,
  passed: { type: Boolean, default: false },
  date: { type: Date, default: Date.now }
});

export default mongoose.model('Exam', examSchema);
