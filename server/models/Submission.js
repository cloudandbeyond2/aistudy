import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: String, // Text submission
    fileUrl: String, // File upload
    grade: String,
    feedback: String,
    status: { type: String, enum: ['pending', 'submitted', 'graded', 'resubmit_required'], default: 'submitted' },
    submittedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

export default mongoose.model('Submission', submissionSchema);
