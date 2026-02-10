import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
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
        type: String, // Project, Practical, Research
        required: true
    },
    department: {
        type: String,
        default: 'all'
    },
    dueDate: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Project', projectSchema);
