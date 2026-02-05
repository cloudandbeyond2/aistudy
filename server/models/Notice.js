import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema({
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    audience: { type: String, default: 'all' }, // 'all', 'grade-10', etc.
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Notice', noticeSchema);
