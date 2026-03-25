import mongoose from 'mongoose';

const staffCourseLimitRequestSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true // org_admin
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true // dept_admin
    },
    currentCourseLimit: {
      type: Number,
      default: 0
    },
    requestedCourseLimit: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    adminComment: {
      type: String,
      default: ''
    },
    processedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

staffCourseLimitRequestSchema.index({ organizationId: 1, status: 1, createdAt: -1 });
staffCourseLimitRequestSchema.index({ staffId: 1, status: 1, createdAt: -1 });

export default mongoose.model('StaffCourseLimitRequest', staffCourseLimitRequestSchema);

