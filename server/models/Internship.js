import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    dueDate: { type: Date },
    status: { type: String, enum: ['pending', 'submitted', 'revision', 'in-progress', 'completed', 'review'], default: 'pending' },
    submissionUrl: { type: String, default: '' },
    feedback: { type: String, default: '' },
    mentorNote: { type: String, default: '' }
});

const dailyFollowupSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    log: { type: String, required: true },
    status: { type: String, default: 'posted' }, // posted | reviewed
    mentorNote: { type: String, default: '' }
});

const studyPlanItemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, default: '' },
    completed: { type: Boolean, default: false }
});

const internshipSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    title: {
        type: String,
        required: true // e.g. "Software Development Intern" 
    },
    domain: {
        type: String,
        default: 'General' // e.g. "Web Development", "AI/ML", "Digital Marketing"
    },
    internshipType: {
        type: String,
        enum: ['training', 'professional', 'research', 'general'],
        default: 'general'
    },
    description: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['requested', 'active', 'completed', 'cancelled'],
        default: 'active'
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    tasks: [taskSchema],
    dailyFollowups: [dailyFollowupSchema],
    studyPlan: [studyPlanItemSchema],
    resources: [{ title: String, link: String }],
    exerciseTopics: [String],
    overallFeedback: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Internship', internshipSchema);
