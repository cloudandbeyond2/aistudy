import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    action: {
      type: String,
      enum: ["viewed", "completed"],
      required: true,
    },
  },
  {
    timestamps: true, // ✅ createdAt auto
  }
);

export default mongoose.model("Analytics", analyticsSchema);