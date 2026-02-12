import mongoose from 'mongoose';

const studentProgressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Can be Course or OrgCourse
    completedSubtopics: [{
        topicTitle: String,
        subtopicTitle: String,
        completedAt: { type: Date, default: Date.now }
    }],
    totalSubtopics: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
});

// Enforce unique progress per user/course
studentProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default mongoose.model('StudentProgress', studentProgressSchema);
