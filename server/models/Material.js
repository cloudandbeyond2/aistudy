import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema({
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
        type: String
    },
    fileUrl: {
        type: String,
        required: true
    },
    type: {
        type: String, // PDF, Document, Link
        default: 'PDF'
    },
    department: {
        type: String,
        default: 'all'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Material', materialSchema);
