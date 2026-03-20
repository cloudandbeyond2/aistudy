import mongoose from 'mongoose';

const organizationPlanSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      unique: true
    },
    planName: {
      type: String,
      enum: ['1months', '3months', '6months'],
      required: true,
      description: 'Duration: 1 month, 3 months, or 6 months'
    },
    aiCourseSlots: {
      type: Number,
      default: 20,
      description: 'Default 20 slots for AI course generation'
    },
    additionalRequestSlots: {
      type: Number,
      default: 0,
      description: 'Additional custom request slots'
    },
    studentSlotPrice: {
      type: Number,
      default: 1000,
      currency: 'INR',
      description: 'Price per student slot - ₹1000 (customizable future)'
    },
    totalStudentSlots: {
      type: Number,
      description: 'Total calculated slots = (20 + additionalRequestSlots)'
    },
    totalPrice: {
      type: Number,
      description: 'Total price = totalStudentSlots * studentSlotPrice'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      description: 'Auto-calculated based on planName duration'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    features: {
      allowAICreation: { type: Boolean, default: true },
      allowManualCreation: { type: Boolean, default: true },
      allowCareerPlacement: { type: Boolean, default: true }
    },
    metadata: {
      notes: String,
      customization: mongoose.Schema.Types.Mixed
    }
  },
  { timestamps: true }
);

// Middleware to calculate totalStudentSlots and totalPrice before save
organizationPlanSchema.pre('save', function () {
  // Calculate total student slots
  this.totalStudentSlots = 20 + (this.additionalRequestSlots || 0);
  
  // Calculate total price
  this.totalPrice = this.totalStudentSlots * (this.studentSlotPrice || 1000);

  // Calculate end date based on plan duration
  const startDate = this.startDate || new Date();
  let endDate = new Date(startDate);

  if (this.planName === '1months') {
    endDate.setMonth(endDate.getMonth() + 1);
  } else if (this.planName === '3months') {
    endDate.setMonth(endDate.getMonth() + 3);
  } else if (this.planName === '6months') {
    endDate.setMonth(endDate.getMonth() + 6);
  }

  this.endDate = endDate;
});

export default mongoose.model('OrganizationPlan', organizationPlanSchema);
