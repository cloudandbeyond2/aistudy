import mongoose from "mongoose";

const limitRequestSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // The Org Admin requesting
    },
    requestedSlot: {
        type: Number,
    },
    requestedCustomLimit: {
        type: Number,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    adminComment: {
        type: String,
        default: ""
    }
  },
  { timestamps: true }
);

export default mongoose.model("LimitRequest", limitRequestSchema);
