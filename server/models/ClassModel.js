import mongoose from 'mongoose';

const classSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    section: { type: String, required: true },
    students: { type: Number, default: 0 },
    time: { type: String, required: true },
    room: { type: String, required: true },
  },
  { timestamps: true }
);

const Class = mongoose.model('Class', classSchema);

export default Class;