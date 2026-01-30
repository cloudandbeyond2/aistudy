import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  user: String,
  content: { type: String, required: true },
  type: String,
  mainTopic: String,
  photo: String,
  date: { type: Date, default: Date.now },
  end: { type: Date, default: Date.now },
  completed: { type: Boolean, default: false },
  restricted: { type: Boolean, default: false }
});

// Index for faster user queries
courseSchema.index({ user: 1 });

export default mongoose.model('Course', courseSchema);
