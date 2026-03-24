import mongoose from 'mongoose';

const orgCourseSchema = new mongoose.Schema({
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    title: { type: String, required: true },
    description: String,
    type: { type: String, default: 'video & text course' },
    department: String, // To assign to a specific department
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
        attemptLimit: { type: Number, default: 2 },
        cooldownMinutes: { type: Number, default: 60 },
        passPercentage: { type: Number, default: 50 },
        questionCount: { type: Number, default: 10 },
        difficultyMode: { type: String, enum: ['easy', 'medium', 'difficult', 'mixed'], default: 'mixed' },
        shuffleQuestions: { type: Boolean, default: true },
        shuffleOptions: { type: Boolean, default: true },
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
