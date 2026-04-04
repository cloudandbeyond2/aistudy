// import mongoose from 'mongoose';

// const notebookSchema = new mongoose.Schema({
//   userId: { type: String, required: true }, // ✅ FIXED
//   generatedContent: { type: Object, default: {} },
// }, { timestamps: true });

// export default mongoose.model('Notebook', notebookSchema);
import mongoose from 'mongoose';

const notebookSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: String, // ✅ ADD THIS
  generatedContent: { type: Object, default: {} },
  sources: { type: Array, default: [] },
  chatHistory: { type: Array, default: [] }
}, { timestamps: true });
export default mongoose.model('Notebook', notebookSchema);