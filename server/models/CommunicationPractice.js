import mongoose from 'mongoose';

const vocabularySchema = new mongoose.Schema({
  word: { type: String, required: true },
  meaning: { type: String, required: true },
  example: { type: String },
  savedAt: { type: Date, default: Date.now },
  mastered: { type: Boolean, default: false }
});

const practiceLogSchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD
  scenario: { type: String, required: true },
  userResponse: { type: String, required: true },
  feedback: { type: String },
  score: { type: Number, default: 0 },
  xpAwarded: { type: Number, default: 0 }
});

const testScoreSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  xpAwarded: { type: Number, default: 0 }
});

const communicationPracticeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  language: { type: String, default: 'English' }, // Could be expanded later
  level: { type: Number, default: 1, min: 1, max: 10 },
  xp: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastActiveDate: { type: String, default: null }, // YYYY-MM-DD
  vocabularyBank: [vocabularySchema],
  practiceLogs: [practiceLogSchema],
  testScores: [testScoreSchema]
}, { timestamps: true });

// Static XP thresholds for each level (Same as SkillBooster to maintain consistency)
communicationPracticeSchema.statics.XP_THRESHOLDS = [0, 50, 150, 300, 500, 750, 1050, 1400, 1800, 2500];

// Method to recalculate level from XP
communicationPracticeSchema.methods.recalculateLevel = function () {
  const thresholds = [0, 50, 150, 300, 500, 750, 1050, 1400, 1800, 2500];
  let newLevel = 1;
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (this.xp >= thresholds[i]) {
      newLevel = i + 1;
      break;
    }
  }
  this.level = Math.min(newLevel, 10);
};

export default mongoose.model('CommunicationPractice', communicationPracticeSchema);
