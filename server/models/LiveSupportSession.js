import mongoose from 'mongoose';

const liveSupportSessionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  status: {
    type: String,
    enum: ['Active', 'Closed'],
    default: 'Active'
  }
}, { timestamps: true });

export default mongoose.model('LiveSupportSession', liveSupportSessionSchema);
