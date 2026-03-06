import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        default: null
    },
    // Optional: student who submitted this project (for showcase)
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String, // Project, Practical, Research, Showcase
        required: true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    dueDate: {
        type: Date
    },
    // Student showcase fields
    githubUrl: { type: String, default: '' },
    liveUrl: { type: String, default: '' },
    techStack: { type: [String], default: [] },
    image: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
    isPublic: { type: Boolean, default: true },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Project', projectSchema);
