import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  user: String,
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  content: { type: String, required: true },
  type: String,
  mainTopic: String,
  department: String, // Department assignment for filtering
  photo: String,
  date: { type: Date, default: Date.now },
  end: { type: Date, default: Date.now },
  completed: { type: Boolean, default: false },
  restricted: { type: Boolean, default: false }
});

// Index for faster user queries
courseSchema.index({ user: 1 });

export default mongoose.model('Course', courseSchema);
