import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    platform: {
        type: String,
        enum: ['google-meet', 'zoom', 'other'],
        default: 'other'
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
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

export default mongoose.model('Meeting', meetingSchema);
