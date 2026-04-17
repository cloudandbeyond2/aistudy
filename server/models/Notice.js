// import mongoose from 'mongoose';

// const noticeSchema = new mongoose.Schema({
//     organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
//     title: { type: String, required: true },
//     content: { type: String, required: true },
//     audience: { type: String, default: 'all' }, // 'all', 'grade-10', etc.
//     department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
//     createdAt: { type: Date, default: Date.now }
// });

// export default mongoose.model('Notice', noticeSchema);


import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    audience: {
      type: String,
      enum: ['all', 'students', 'staff'],
      default: 'all',
    },
    /**
     * Scoping rules:
     *  - null/undefined  → org-wide notice, visible to ALL students & staff
     *  - ObjectId        → only visible to students whose deptId matches
     *
     * Who sets this:
     *  - org_admin  → can pick any dept from the dropdown, or leave blank (org-wide)
     *  - dept_admin → backend always forces this to their own deptId
     */
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    /**
     * isImportant → shown with "Important" badge + priority 'high' on student view
     * isPinned    → always sorted to the top on both admin and student views
     */
    isImportant: {
      type: Boolean,
      default: false,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // auto-manages createdAt + updatedAt
  }
);

// Fast lookups for org-level and dept-scoped notice lists
noticeSchema.index({ organizationId: 1, createdAt: -1 });
noticeSchema.index({ organizationId: 1, department: 1, createdAt: -1 });
noticeSchema.index({ organizationId: 1, isPinned: -1, createdAt: -1 });

const Notice = mongoose.model('Notice', noticeSchema);

export default Notice;
