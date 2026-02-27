import mongoose from "mongoose";

/* ================= MESSAGE SCHEMA ================= */
const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: String, // "student" or "org_admin"
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    readByOrg: {
      type: Boolean,
      default: false,
    },
    readByStudent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

/* ================= STUDENT TICKET SCHEMA ================= */
const studentTicketSchema = new mongoose.Schema(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "Open",
    },
    messages: [messageSchema],
  },
  { timestamps: true }
);

const StudentTicket = mongoose.model("StudentTicket", studentTicketSchema);
export default StudentTicket;