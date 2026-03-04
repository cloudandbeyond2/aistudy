
// import mongoose from "mongoose";

// /* ================= MESSAGE SCHEMA ================= */
// const messageSchema = new mongoose.Schema(
//   {
//     sender: {
//       type: String, // "admin" or "user"
//       required: true,
//     },
//     message: {
//       type: String,
//       required: true,
//     },
//     readByAdmin: {
//       type: Boolean,
//       default: false,
//     },
//     readByUser: {
//       type: Boolean,
//       default: false,
//     },
//   },
//   { timestamps: true }
// );

// /* ================= TICKET SCHEMA ================= */
// const ticketSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     subject: {
//       type: String,
//       required: true,
//     },
//     description: {
//       type: String,
//       required: true,
//     },
//     status: {
//       type: String,
//       default: "Open",
//     },
//     priority: {
//       type: String,
//       default: "Normal",
//     },
//     slaHours: {
//       type: Number,
//       default: 48,
//     },

//     messages: [messageSchema],
//   },
//   { timestamps: true }
// );

// const Ticket = mongoose.model("Ticket", ticketSchema);
// export default Ticket;

import mongoose from "mongoose";

/* ================= MESSAGE SCHEMA ================= */
const messageSchema = new mongoose.Schema(
{
  sender: {
    type: String,
    enum: ["admin", "user"],
    required: true
  },

  message: {
    type: String,
    required: true
  },

  readByAdmin: {
    type: Boolean,
    default: false
  },

  readByUser: {
    type: Boolean,
    default: false
  }

},
{ timestamps: true }
);


/* ================= TICKET SCHEMA ================= */

const ticketSchema = new mongoose.Schema(
{

  /* Ticket Number (for admin table) */
  ticketId: {
    type: String,
    unique: true
  },

  /* Who created ticket */
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  /* Main Issue */
  subject: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  /* Ticket Status */
  status: {
    type: String,
    enum: ["Open", "In Progress", "Resolved", "Closed"],
    default: "Open"
  },

  /* Priority */
  priority: {
    type: String,
    enum: ["Low", "Normal", "High"],
    default: "Normal"
  },

  /* SLA for paid users */
  slaHours: {
    type: Number,
    default: 48
  },

  /* Last activity (used for sorting tickets) */
  lastMessageAt: {
    type: Date,
    default: Date.now
  },

  /* Chat conversation */
  messages: [messageSchema]

},
{ timestamps: true }
);


/* ================= EXPORT MODEL ================= */

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;