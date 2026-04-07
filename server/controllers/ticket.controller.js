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
import Admin from "../models/Admin.js";

const getSuperAdminNotificationRecipients = async () => {
  const admins = await Admin.find({}).select("email").lean();
  const adminEmails = admins.map((admin) => admin.email).filter(Boolean);

  if (!adminEmails.length) {
    return [];
  }

  return User.find({ email: { $in: adminEmails } }).select("_id email");
};

const isOrganizationSupportTicketOwner = async (ticketOwnerId) => {
  const ticketOwner = await User.findById(ticketOwnerId).select("role isOrganization");

  if (!ticketOwner) {
    return false;
  }

  return ticketOwner.role === "org_admin" || ticketOwner.isOrganization === true;
};

export const buildSupportMailTemplate = ({
  heading = "New Support Request",
  title,
  fields = [],
  messageLabel = "Message",
  message,
}) => {
  const rows = fields
    .map(
      ({ label, value }) => `
        <tr>
          <td style="padding:10px 0;color:#64748b;font-size:14px;font-weight:600;white-space:nowrap;">${label}</td>
          <td style="padding:10px 0;color:#0f172a;font-size:14px;font-weight:700;padding-left:18px;">${value || "-"}</td>
        </tr>
      `
    )
    .join("");

  return `
    <div style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:720px;margin:0 auto;padding:32px 16px;">
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;overflow:hidden;box-shadow:0 20px 60px -35px rgba(15,23,42,0.35);">
          <div style="background:linear-gradient(135deg,#0f172a 0%,#1d4ed8 100%);padding:24px 28px;color:#fff;">
            <div style="font-size:12px;letter-spacing:0.14em;text-transform:uppercase;font-weight:700;opacity:0.8;">${heading}</div>
            <h2 style="margin:10px 0 0;font-size:24px;line-height:1.3;">${title}</h2>
          </div>
          <div style="padding:28px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
              ${rows}
            </table>
            <div style="margin-top:24px;padding-top:20px;border-top:1px solid #e2e8f0;">
              <div style="color:#64748b;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">${messageLabel}</div>
              <div style="color:#0f172a;font-size:14px;line-height:1.8;white-space:pre-wrap;">${message || "-"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
};

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

    const isOrgTicket = await isOrganizationSupportTicketOwner(userId);

    /* USER NOTIFICATION */
    if (!isOrgTicket) {
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
    }

    /* ADMIN NOTIFICATION */
    try {
      const admins = await getSuperAdminNotificationRecipients();

      await Promise.all(
        admins.map((admin) =>
          Notification.create({
            user: admin._id,
            message: `New support ticket "${subject}" created.`,
            type: "info",
            link: "/dashboard/tickets"
          })
        )
      );

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

        const admins = await getSuperAdminNotificationRecipients();

        await Promise.all(
          admins.map((admin) =>
            Notification.create({
              user: admin._id,
              message: `${username} replied to ticket "${ticket.subject}".`,
              type: "info",
              link: "/dashboard/tickets"
            })
          )
        );

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
