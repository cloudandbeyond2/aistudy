import mongoose from 'mongoose';

const orgCourseSchema = new mongoose.Schema({
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    title: { type: String, required: true },
    description: String,
    type: { type: String, default: 'video & text course' },
    isAiGenerated: { type: Boolean, default: false },
    courseMeta: { type: mongoose.Schema.Types.Mixed, default: {} },
    department: String, // To assign to a specific department
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    isPublished: { type: Boolean, default: false },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
    publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    publishedAt: { type: Date, default: null },
    approvalNote: { type: String, default: '' },
    topics: [{
        title: String,
        subtopics: [{
            title: String,
            content: String,
            videoUrl: String,
            diagram: String,
            order: Number
        }],
        order: Number
    }],
    quizzes: [{
        question: String,
        options: [String],
        answer: String,
        explanation: String,
        difficulty: { type: String, enum: ['easy', 'medium', 'difficult'], default: 'medium' }
    }],
    quizSettings: {
        examMode: { type: Boolean, default: false },
        quizMode: { type: String, enum: ['practice', 'assessment', 'secure'], default: 'secure' },
        attemptLimit: { type: Number, default: 2 },
        cooldownMinutes: { type: Number, default: 60 },
        passPercentage: { type: Number, default: 50 },
        questionCount: { type: Number, default: 10 },
        difficultyMode: { type: String, enum: ['easy', 'medium', 'difficult', 'mixed'], default: 'mixed' },
        shuffleQuestions: { type: Boolean, default: true },
        shuffleOptions: { type: Boolean, default: true },
        reviewMode: {
            type: String,
            enum: ['after_submit_with_answers', 'after_submit_without_answers', 'score_only'],
            default: 'after_submit_with_answers'
        },
        positiveMarkPerCorrect: { type: Number, default: 1 },
        negativeMarkingEnabled: { type: Boolean, default: false },
        negativeMarkPerWrong: { type: Number, default: 0.25 },
        sectionPatternEnabled: { type: Boolean, default: false },
        sections: {
            easy: { type: Number, default: 0 },
            medium: { type: Number, default: 0 },
            difficult: { type: Number, default: 0 }
        },
        proctoring: {
            requireCamera: { type: Boolean, default: true },
            requireMicrophone: { type: Boolean, default: true },
            detectFullscreenExit: { type: Boolean, default: true },
            detectTabSwitch: { type: Boolean, default: true },
            detectCopyPaste: { type: Boolean, default: true },
            detectContextMenu: { type: Boolean, default: true },
            detectNoise: { type: Boolean, default: true }
        }
    },
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Specific students or empty for all
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('OrgCourse', orgCourseSchema);
