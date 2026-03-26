import mongoose from 'mongoose';

const deptCourseLimitRequestSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true
    },
    deptAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true // dept_admin
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

deptCourseLimitRequestSchema.index({ organizationId: 1, status: 1, createdAt: -1 });
deptCourseLimitRequestSchema.index({ deptAdminId: 1, status: 1, createdAt: -1 });

export default mongoose.model('DeptCourseLimitRequest', deptCourseLimitRequestSchema);
