// import mongoose from "mongoose";

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
//   },
//   { timestamps: true }
// );

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

//     // 🔔 Notification fields
//     unreadByAdmin: {
//   type: Boolean,
//   default: false,
// },
// unreadByUser: {
//   type: Boolean,
//   default: false,
// },
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
      type: String, // "admin" or "user"
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    readByAdmin: {
      type: Boolean,
      default: false,
    },
    readByUser: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

/* ================= TICKET SCHEMA ================= */
const ticketSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "Open",
    },
    priority: {
      type: String,
      default: "Normal",
    },
    slaHours: {
      type: Number,
      default: 48,
    },

    messages: [messageSchema],
  },
  { timestamps: true }
);

const Ticket = mongoose.model("Ticket", ticketSchema);
export default Ticket;