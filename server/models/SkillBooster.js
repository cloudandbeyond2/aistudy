import mongoose from 'mongoose';

const practiceLogSchema = new mongoose.Schema({
  task: { type: String, required: true },
  completed: { type: Boolean, default: false },
  notes: { type: String, default: '' },
  xpAwarded: { type: Number, default: 0 },
  completedAt: { type: Date, default: null }
}, { timestamps: true });

const dailyTipSchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD
  tip: { type: String, default: '' },
  trick: { type: String, default: '' },
  practiceIdea: { type: String, default: '' },
  category: { type: String, default: '' }
});

const roadmapMilestoneSchema = new mongoose.Schema({
  order: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  estimatedDays: { type: Number, default: 7 },
  skillTags: [String],
  completed: { type: Boolean, default: false }
});

const skillBoosterSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  topic: {
    type: String,
    enum: [
      'Career Building',
      'Health & Wellness',
      'Work Tasks & Productivity',
      'Leadership & Management',
      'Communication Skills',
      'Technical Skills',
      'Personal Finance',
      'Creativity & Innovation',
      'Custom'
    ],
    default: 'Career Building'
  },
  customTopic: { type: String, default: '' },
  level: { type: Number, default: 1, min: 1, max: 10 },
  xp: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastActiveDate: { type: String, default: null }, // YYYY-MM-DD
  roadmap: [roadmapMilestoneSchema],
  currentMilestoneIndex: { type: Number, default: 0 },
  dailyTips: [dailyTipSchema],
  practiceLog: [practiceLogSchema]
}, { timestamps: true });

// Static XP thresholds for each level
skillBoosterSchema.statics.XP_THRESHOLDS = [0, 50, 150, 300, 500, 750, 1050, 1400, 1800, 2500];

// Method to recalculate level from XP
skillBoosterSchema.methods.recalculateLevel = function () {
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

export default mongoose.model('SkillBooster', skillBoosterSchema);
