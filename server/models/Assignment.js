import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
    courseLikeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' }, // Optional link to a course
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    topic: { type: String, required: true },
    description: String,
    dueDate: Date,
    department: String,
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    generatedByAI: { type: Boolean, default: false },
    questions: [{
        questionText: String,
        type: { type: String, enum: ['text', 'upload'], default: 'text' }
    }],
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Assignment', assignmentSchema);
