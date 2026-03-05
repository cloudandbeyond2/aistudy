import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  room: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ["Lecture", "Lab", "Meeting", "Workshop"],
    default: "Lecture"
  }
}, { timestamps: true });

export default mongoose.model("Schedule", scheduleSchema);