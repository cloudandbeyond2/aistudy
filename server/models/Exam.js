import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
  course: String,
  userId: String, // ID of the student who took the exam
  exam: String,
  marks: String,
  examType: { type: String, enum: ['legacy', 'org_exam'], default: 'legacy' },
  organizationId: { type: String, default: '' },
  topic: { type: String, default: '' },
  attemptNumber: { type: Number, default: 1 },
  status: { type: String, enum: ['in_progress', 'submitted', 'abandoned'], default: 'submitted' },
  score: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  passPercentage: { type: Number, default: 50 },
  difficultyMode: { type: String, default: 'mixed' },
  startedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date },
  nextAttemptAvailableAt: { type: Date },
  questionOrder: [{ type: String }],
  answers: [{
    questionId: String,
    selectedOptionId: String,
    correctOptionId: String,
    isCorrect: Boolean
  }],
  securityEvents: [{
    type: { type: String, default: 'info' },
    severity: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    details: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now }
  }],
  malpracticeFlag: { type: Boolean, default: false },
  adminNotified: { type: Boolean, default: false },
  passed: { type: Boolean, default: false },
  date: { type: Date, default: Date.now }
});

export default mongoose.model('Exam', examSchema);
