import mongoose from 'mongoose';

const quizRetakeRequestSchema = new mongoose.Schema(
  {
    course: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'consumed'],
      default: 'pending',
      index: true
    },
    latestScore: { type: Number, default: 0 },
    latestPercentage: { type: Number, default: 0 },
    requestReason: { type: String, default: '' },
    adminComment: { type: String, default: '' },
    reviewedBy: { type: String, default: '' },
    reviewedAt: { type: Date },
    consumedAt: { type: Date }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('QuizRetakeRequest', quizRetakeRequestSchema);
