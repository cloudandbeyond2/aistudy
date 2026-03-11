import mongoose from 'mongoose';

const currentAffairSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'General'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model('InterviewCurrentAffair', currentAffairSchema);
