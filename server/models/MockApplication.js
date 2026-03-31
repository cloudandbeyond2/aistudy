import mongoose from 'mongoose';

const mockApplicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  driveId: { type: mongoose.Schema.Types.ObjectId, ref: 'MockInterviewDrive', default: null }, // Null for free-form mocks
  type: { type: String, enum: ['Self', 'Assigned'], default: 'Self' },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  
  status: { type: String, enum: ['Started', 'AI_Completed', 'TMR_Mock', 'Finalized'], default: 'Started' },
  currentRound: { type: String, enum: ['AI_Screening', 'TMR_Mock', 'Completed'], default: 'AI_Screening' },
  
  genAiFeedback: {
    score: { type: Number, default: 0 },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    technicalGaps: [{ type: String }],
    transcript: [{ role: String, message: String, timestamp: Date }],
    overallAnalysis: { type: String }
  },
  
  tmrFeedback: {
    communication: { type: Number, min: 0, max: 10, default: 0 },
    technical: { type: Number, min: 0, max: 10, default: 0 },
    notes: { type: String },
    evaluatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    evaluatedAt: { type: Date }
  },
  
  isPlacementReadyReported: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('MockApplication', mockApplicationSchema);
