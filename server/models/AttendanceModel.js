import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
{
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true
  },

  date: {
    type: String,
    required: true
  },

  status: {
    type: String,
    enum: ["Present", "Late", "Absent"],
    required: true
  },

  time: {
    type: String
  }

},
{ timestamps: true }
);

export default mongoose.model("Attendance", attendanceSchema);
