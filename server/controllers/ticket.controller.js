// import Ticket from "../models/ticket.model.js";
// import mongoose from "mongoose";

// /* ================= CREATE TICKET ================= */
// export const createTicket = async (req, res) => {
//   try {
//     const { subject, description, userId, userType } = req.body;

//     if (!subject || !description || !userId) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields are required",
//       });
//     }

//     /* Priority + SLA */
//     let sla = 48;
//     let priority = "Normal";

//     if (userType === "monthly") {
//       sla = 24;
//       priority = "High";
//     }

//     if (userType === "yearly" || userType === "forever") {
//       sla = 12;
//       priority = "High";
//     }

//     /* Ticket Number */
//     const ticketNumber = "TCK-" + Date.now();

//     const ticket = new Ticket({
//       ticketId: ticketNumber,
//       userId,
//       subject,
//       description,
//       slaHours: sla,
//       priority,
//       status: "Open",
//       lastMessageAt: new Date(),
//       messages: [
//         {
//           sender: "user",
//           message: description,
//           readByAdmin: false,
//           readByUser: true,
//         },
//       ],
//     });

//     await ticket.save();

//     res.status(201).json({
//       success: true,
//       message: "Ticket created successfully",
//       ticket,
//     });

//   } catch (error) {
//     console.error("CREATE TICKET ERROR:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };


// /* ================= GET ALL TICKETS ================= */
// export const getAllTickets = async (req, res) => {
//   try {

//     const tickets = await Ticket.find()
//       .populate("userId", "mName email")
//       .sort({ lastMessageAt: -1 })
//       .lean();

//     const formatted = tickets.map((t) => ({
//       ...t,
//       userDisplay: t.userId?.mName || "User",
//       lastUpdate: t.lastMessageAt,
//     }));

//     res.json({
//       success: true,
//       tickets: formatted,
//     });

//   } catch (error) {
//     console.error("GET ALL ERROR:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };


// /* ================= GET USER TICKETS ================= */
// export const getUserTickets = async (req, res) => {
//   try {

//     const { userId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid user ID",
//       });
//     }

//     const tickets = await Ticket.find({
//       userId: new mongoose.Types.ObjectId(userId),
//     })
//       .sort({ lastMessageAt: -1 });

//     res.json({
//       success: true,
//       tickets,
//     });

//   } catch (error) {
//     console.error("GET USER ERROR:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };


// /* ================= UPDATE STATUS ================= */
// export const updateTicketStatus = async (req, res) => {
//   try {

//     const { ticketId } = req.params;
//     const { status } = req.body;

//     const updatedTicket = await Ticket.findByIdAndUpdate(
//       ticketId,
//       { status },
//       { new: true }
//     );

//     if (!updatedTicket) {
//       return res.status(404).json({
//         success: false,
//         message: "Ticket not found",
//       });
//     }

//     res.json({
//       success: true,
//       message: "Ticket updated",
//       ticket: updatedTicket,
//     });

//   } catch (error) {
//     console.error("UPDATE ERROR:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };


// /* ================= ADD REPLY ================= */
// export const addTicketReply = async (req, res) => {
//   try {

//     const { ticketId } = req.params;
//     const { sender, message } = req.body;

//     const ticket = await Ticket.findById(ticketId);

//     if (!ticket) {
//       return res.status(404).json({
//         success: false,
//         message: "Ticket not found",
//       });
//     }

//     ticket.messages.push({
//       sender,
//       message,
//       readByAdmin: sender === "admin",
//       readByUser: sender === "user",
//     });

//     /* Update last activity */
//     ticket.lastMessageAt = new Date();

//     /* STATUS FLOW */
//     if (sender === "admin" && ticket.status === "Open") {
//       ticket.status = "In Progress";
//     }

//     if (sender === "user" && ticket.status === "Resolved") {
//       ticket.status = "In Progress";
//     }

//     await ticket.save();

//     res.json({
//       success: true,
//       ticket,
//     });

//   } catch (error) {
//     console.error("ADD REPLY ERROR:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };


// /* ================= MARK AS READ ================= */
// export const markAsRead = async (req, res) => {
//   try {

//     const { ticketId } = req.params;
//     const { role } = req.body;

//     const ticket = await Ticket.findById(ticketId);

//     if (!ticket) {
//       return res.status(404).json({
//         success: false,
//         message: "Ticket not found",
//       });
//     }

//     ticket.messages = ticket.messages.map((msg) => {

//       if (role === "admin" && !msg.readByAdmin) {
//         msg.readByAdmin = true;
//       }

//       if (role === "user" && !msg.readByUser) {
//         msg.readByUser = true;
//       }

//       return msg;
//     });

//     await ticket.save();

//     res.json({
//       success: true,
//     });

//   } catch (error) {
//     console.error("MARK AS READ ERROR:", error);
//     res.status(500).json({
//       success: false,
//     });
//   }
// };

import Ticket from "../models/ticket.model.js";
import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

/* ================= CREATE TICKET ================= */
export const createTicket = async (req, res) => {
  try {
    const { subject, description, userId, userType } = req.body;

    if (!subject || !description || !userId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    /* Priority + SLA */
    let sla = 48;
    let priority = "Normal";

    if (userType === "monthly") {
      sla = 24;
      priority = "High";
    }

    if (userType === "yearly" || userType === "forever") {
      sla = 12;
      priority = "High";
    }

    /* Ticket Number */
    const ticketNumber = "TCK-" + Date.now();

    const ticket = new Ticket({
      ticketId: ticketNumber,
      userId,
      subject,
      description,
      slaHours: sla,
      priority,
      status: "Open",
      lastMessageAt: new Date(),
      messages: [
        {
          sender: "user",
          message: description,
          readByAdmin: false,
          readByUser: true,
        },
      ],
    });

    await ticket.save();

    /* USER NOTIFICATION */
    try {
      await Notification.create({
        user: userId,
        message: `Your support ticket "${subject}" has been created successfully.`,
        type: "info",
        link: "/dashboard/support",
      });
    } catch (err) {
      console.log("User notification failed:", err);
    }

    /* ADMIN NOTIFICATION */
    try {

      const admins = await User.find({
        $or: [
          { role: "org_admin" },
          { role: "user", isOrganization: false }
        ]
      });

      for (const admin of admins) {
        await Notification.create({
          user: admin._id,
          message: `New support ticket "${subject}" created.`,
          type: "info",
          link: "/dashboard/tickets"
        });
      }

    } catch (err) {
      console.log("Admin notification failed:", err);
    }
    res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      ticket,
    });

  } catch (error) {
    console.error("CREATE TICKET ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ================= GET ALL TICKETS ================= */
export const getAllTickets = async (req, res) => {
  try {

    const tickets = await Ticket.find()
      .populate("userId", "mName email")
      .sort({ lastMessageAt: -1 })
      .lean();

    const formatted = tickets.map((t) => ({
      ...t,
      userDisplay: t.userId?.mName || "User",
      lastUpdate: t.lastMessageAt,
    }));

    res.json({
      success: true,
      tickets: formatted,
    });

  } catch (error) {
    console.error("GET ALL ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


/* ================= GET USER TICKETS ================= */
export const getUserTickets = async (req, res) => {
  try {

    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const tickets = await Ticket.find({
      userId: new mongoose.Types.ObjectId(userId),
    }).sort({ lastMessageAt: -1 });

    res.json({
      success: true,
      tickets,
    });

  } catch (error) {
    console.error("GET USER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


/* ================= UPDATE STATUS ================= */
export const updateTicketStatus = async (req, res) => {
  try {

    const { ticketId } = req.params;
    const { status } = req.body;

    const updatedTicket = await Ticket.findByIdAndUpdate(
      ticketId,
      { status },
      { new: true }
    );

    if (!updatedTicket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    /* STATUS CHANGE NOTIFICATION */
    try {
      await Notification.create({
        user: updatedTicket.userId,
        message: `Your ticket "${updatedTicket.subject}" status changed to ${status}.`,
        type: "info",
        link: "/dashboard/support",
      });
    } catch (err) {
      console.log("Notification failed:", err);
    }

    res.json({
      success: true,
      message: "Ticket updated",
      ticket: updatedTicket,
    });

  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


/* ================= ADD REPLY ================= */
export const addTicketReply = async (req, res) => {
  try {

    const { ticketId } = req.params;
    const { sender, message } = req.body;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    ticket.messages.push({
      sender,
      message,
      readByAdmin: sender === "admin",
      readByUser: sender === "user",
    });

    ticket.lastMessageAt = new Date();

    /* STATUS FLOW */
    if (sender === "admin" && ticket.status === "Open") {
      ticket.status = "In Progress";
    }

    if (sender === "user" && ticket.status === "Resolved") {
      ticket.status = "In Progress";
    }

    await ticket.save();

    /* ADMIN REPLY NOTIFICATION (User gets notification) */
    if (sender === "admin") {
      try {
        await Notification.create({
          user: ticket.userId,
          message: `Admin replied to your ticket "${ticket.subject}".`,
          type: "info",
          link: "/dashboard/support",
        });
      } catch (err) {
        console.log("Notification failed:", err);
      }
    }

    /* USER REPLY NOTIFICATION (Admins get notification) */
    if (sender === "user") {
      try {

        // Get the user/org name
        const ticketUser = await User.findById(ticket.userId);
        const username = ticketUser?.mName || ticketUser?.email || "User";

        const admins = await User.find({
          $or: [
            { role: "org_admin" },
            { role: "user", isOrganization: false }
          ]
        });

        for (const admin of admins) {
          await Notification.create({
            user: admin._id,
            message: `${username} replied to ticket "${ticket.subject}".`,
            type: "info",
            link: "/dashboard/tickets"
          });
        }

      } catch (err) {
        console.log("Admin notification failed:", err);
      }
    }
    res.json({
      success: true,
      ticket,
    });

  } catch (error) {
    console.error("ADD REPLY ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ================= MARK AS READ ================= */
export const markAsRead = async (req, res) => {
  try {

    const { ticketId } = req.params;
    const { role } = req.body;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    ticket.messages = ticket.messages.map((msg) => {

      if (role === "admin" && !msg.readByAdmin) {
        msg.readByAdmin = true;
      }

      if (role === "user" && !msg.readByUser) {
        msg.readByUser = true;
      }

      return msg;
    });

    await ticket.save();

    res.json({
      success: true,
    });

  } catch (error) {
    console.error("MARK AS READ ERROR:", error);
    res.status(500).json({
      success: false,
    });
  }
};