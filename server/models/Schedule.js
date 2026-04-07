import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
  date: {
    type: Date
  },
  day: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
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
    enum: ["Lecture", "Lab", "Meeting", "Workshop", "Deadline", "Study"],
    default: "Lecture"
  },
  visibility: {
    type: String,
    enum: ["organization", "personal", "public"],
    default: "organization"
  },
  organizationId: {
    type: String
  },
  ownerId: {
    type: String
  },
  ownerRole: {
    type: String
  },
  location: {
    type: String,
    default: ""
  },
  color: {
    type: String,
    default: "#2563eb"
  },
  status: {
    type: String,
    enum: ["planned", "in-progress", "done"],
    default: "planned"
  },
  isGoogleEvent: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model("Schedule", scheduleSchema);
