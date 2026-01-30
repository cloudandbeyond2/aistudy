import mongoose from 'mongoose';

const notesSchema = new mongoose.Schema({
  course: String,
  notes: String
});

export default mongoose.model('Notes', notesSchema);
