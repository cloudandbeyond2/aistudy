import mongoose from 'mongoose';

const langSchema = new mongoose.Schema({
  course: String,
  lang: String
});

export default mongoose.model('Lang', langSchema);
