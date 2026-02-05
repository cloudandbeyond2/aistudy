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
            order: Number
        }],
        order: Number
    }],
    quizzes: [{
        question: String,
        options: [String],
        answer: String,
        explanation: String
    }],
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Specific students or empty for all
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('OrgCourse', orgCourseSchema);
