import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema({
 uid: {                           // ✅ Changed from 'userId' to 'uid'
    type: String,
    required: true,
    index: true
  },
  role: {
    type: String,
    default: 'user'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  notes: {
    type: String,
    default: '',
    trim: true
  },
  dueDate: {
    type: Date,
    default: null
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  completed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Todo', todoSchema);
