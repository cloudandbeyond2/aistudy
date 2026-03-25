

// import StudentTicket from "../models/StudentTicket.js";
// import mongoose from "mongoose";

// /* ================= CREATE STUDENT TICKET ================= */
// export const createStudentTicket = async (req, res) => {
//   try {
//     const { subject, message, studentId, orgId } = req.body;

//     if (!subject || !message || !studentId || !orgId) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields are required",
//       });
//     }

//     const ticket = new StudentTicket({
//       subject,
//       studentId,
//       orgId,
//       status: "Open",
//       messages: [
//         {
//           sender: "student",
//           message,
//           readByOrg: false,
//           readByStudent: true,
//         },
//       ],
//     });

//     await ticket.save();

//     res.status(201).json({
//       success: true,
//       message: "Support ticket created successfully",
//       ticket,
//     });
//   } catch (error) {
//     console.error("CREATE STUDENT TICKET ERROR:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };

// /* ================= GET ALL ORG TICKETS ================= */
// export const getOrgStudentTickets = async (req, res) => {
//   try {
//     const { orgId } = req.params;

//     const tickets = await StudentTicket.find({ orgId })
//       .populate({
//         path: "studentId",
//         select: "mName email studentDetails"
//       })
//       .sort({ createdAt: -1 });

//     const formattedTickets = tickets.map(ticket => ({
//       _id: ticket._id,
//       subject: ticket.subject,
//       status: ticket.status,
//       createdAt: ticket.createdAt,
//       messages: ticket.messages,
//       student: {
//         id: ticket.studentId?._id,
//         name: ticket.studentId?.mName,
//         email: ticket.studentId?.email,
//         department: ticket.studentId?.studentDetails?.department,
//         section: ticket.studentId?.studentDetails?.section,
//         rollNo: ticket.studentId?.studentDetails?.rollNo
//       }
//     }));

//     res.json({
//       success: true,
//       tickets: formattedTickets
//     });

//   } catch (error) {
//     console.error("GET ORG TICKETS ERROR:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error"
//     });
//   }
// };
// /* ================= GET STUDENT TICKETS ================= */
// export const getStudentTickets = async (req, res) => {
//   try {
//     const { studentId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(studentId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid student ID",
//       });
//     }

//     const tickets = await StudentTicket.find({
//       studentId: new mongoose.Types.ObjectId(studentId),
//     }).sort({ createdAt: -1 });

//     res.json({
//       success: true,
//       tickets,
//     });
//   } catch (error) {
//     console.error("GET STUDENT TICKETS ERROR:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };

// /* ================= UPDATE STATUS (ORG ADMIN ONLY) ================= */
// export const updateStudentTicketStatus = async (req, res) => {
//   try {
//     const { ticketId } = req.params;
//     const { status } = req.body;

//     const updatedTicket = await StudentTicket.findByIdAndUpdate(
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
//       message: "Ticket status updated",
//       ticket: updatedTicket,
//     });
//   } catch (error) {
//     console.error("UPDATE STATUS ERROR:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };

// /* ================= ADD REPLY ================= */
// export const addStudentTicketReply = async (req, res) => {
//   try {
//     const { ticketId } = req.params;
//     const { sender, message } = req.body;

//     const ticket = await StudentTicket.findById(ticketId);

//     if (!ticket) {
//       return res.status(404).json({
//         success: false,
//         message: "Ticket not found",
//       });
//     }

//     ticket.messages.push({
//       sender,
//       message,
//       readByOrg: sender === "org_admin",
//       readByStudent: sender === "student",
//     });

//     /* 🔄 STATUS LOGIC */
//     if (sender === "org_admin" && ticket.status === "Open") {
//       ticket.status = "In Progress";
//     }

//     if (sender === "student" && ticket.status === "Resolved") {
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
// export const markStudentTicketAsRead = async (req, res) => {
//   try {
//     const { ticketId } = req.params;
//     const { role } = req.body; // "org_admin" or "student"

//     const ticket = await StudentTicket.findById(ticketId);

//     if (!ticket) {
//       return res.status(404).json({
//         success: false,
//         message: "Ticket not found",
//       });
//     }

//     ticket.messages = ticket.messages.map((msg) => {
//       if (role === "org_admin" && !msg.readByOrg) {
//         msg.readByOrg = true;
//       }

//       if (role === "student" && !msg.readByStudent) {
//         msg.readByStudent = true;
//       }

//       return msg;
//     });

//     await ticket.save();

//     res.json({ success: true });
//   } catch (error) {
//     console.error("MARK AS READ ERROR:", error);
//     res.status(500).json({ success: false });
//   }
// };


import StudentTicket from "../models/StudentTicket.js";
import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

/* ================= CREATE STUDENT TICKET ================= */
export const createStudentTicket = async (req, res) => {
  try {
    const { subject, message, studentId, orgId, department } = req.body;

    if (!subject || !message || !studentId || !orgId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const ticket = new StudentTicket({
      subject,
      studentId,
      orgId,
      department: department || "General",
      status: "Open",
      messages: [
        {
          sender: "student",
          message,
          readByOrg: false,
          readByStudent: true,
        },
      ],
    });

    await ticket.save();

    /* 🔔 NOTIFY ORG ADMIN WHEN USER CREATES TICKET */
    try {
      const creator = await User.findById(studentId);
      const creatorName = creator?.mName || "User";
      const creatorRole = creator?.role || "user";

      const orgAdmins = await User.find({
        role: "org_admin",
        $or: [{ organizationId: orgId }, { organization: orgId }]
      });

      const roleDisplay = creatorRole === "student" ? "Student" : "Staff member";

      for (const admin of orgAdmins) {
        await Notification.create({
          user: admin._id,
          message: `${roleDisplay} ${creatorName} created support ticket "${subject}".`,
          type: "info",
          link: "/dashboard/org/student-tickets"
        });
      }

    } catch (err) {
      console.log("Notification error:", err);
    }

    res.status(201).json({
      success: true,
      message: "Support ticket created successfully",
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


/* ================= GET ALL ORG TICKETS ================= */
export const getOrgStudentTickets = async (req, res) => {
  try {

    const { orgId } = req.params;

    const tickets = await StudentTicket.find({ orgId })
      .populate({
        path: "studentId",
        select: "mName email studentDetails"
      })
      .sort({ createdAt: -1 });

    const formattedTickets = tickets.map(ticket => ({
      _id: ticket._id,
      subject: ticket.subject,
      status: ticket.status,
      createdAt: ticket.createdAt,
      messages: ticket.messages,
      department: ticket.department,
      student: {
        id: ticket.studentId?._id,
        name: ticket.studentId?.mName,
        email: ticket.studentId?.email,
        role: ticket.studentId?.role,
        department: ticket.studentId?.studentDetails?.department || ticket.department,
        section: ticket.studentId?.studentDetails?.section,
        rollNo: ticket.studentId?.studentDetails?.rollNo
      }
    }));

    res.json({ success: true, tickets: formattedTickets });

  } catch (error) {
    console.error("GET ORG TICKETS ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


/* ================= GET STUDENT TICKETS ================= */
export const getStudentTickets = async (req, res) => {
  try {

    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, message: "Invalid student ID" });
    }

    const tickets = await StudentTicket.find({
      studentId: new mongoose.Types.ObjectId(studentId),
    })
      .populate({
        path: "studentId",
        select: "studentDetails"
      })
      .sort({ createdAt: -1 });

    const formattedTickets = tickets.map(ticket => ({
      ...ticket._doc,
      department: ticket.department || ticket.studentId?.studentDetails?.department || "General"
    }));

    res.json({
      success: true,
      tickets,
    });

  } catch (error) {
    console.error("GET STUDENT TICKETS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


/* ================= UPDATE STATUS (ORG ADMIN ONLY) ================= */
export const updateStudentTicketStatus = async (req, res) => {
  try {

    const { ticketId } = req.params;
    const { status } = req.body;

    const updatedTicket = await StudentTicket.findByIdAndUpdate(
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

    res.json({
      success: true,
      message: "Ticket status updated",
      ticket: updatedTicket,
    });

  } catch (error) {
    console.error("UPDATE STATUS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


/* ================= ADD REPLY ================= */
export const addStudentTicketReply = async (req, res) => {
  try {

    const { ticketId } = req.params;
    const { sender, message } = req.body;

    const ticket = await StudentTicket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    ticket.messages.push({
      sender,
      message,
      readByOrg: sender === "org_admin",
      readByStudent: sender === "student",
    });

    /* STATUS LOGIC */
    if (sender === "org_admin" && ticket.status === "Open") {
      ticket.status = "In Progress";
    }

    if (sender === "student" && ticket.status === "Resolved") {
      ticket.status = "In Progress";
    }

    await ticket.save();

    /* 🔔 NOTIFY STUDENT WHEN ADMIN REPLIES */
    if (sender === "org_admin") {

      await Notification.create({
        user: ticket.studentId,
        message: `Admin replied to your ticket "${ticket.subject}".`,
        type: "info",
        link: "/dashboard/student/support"
      });

    }

    /* 🔔 NOTIFY ORG ADMIN WHEN STUDENT REPLIES */
    /* 🔔 NOTIFY ORG ADMIN WHEN STUDENT REPLIES */

    if (sender === "student") {

      const admins = await User.find({
        $or: [
          { role: "org_admin", orgId: ticket.orgId },
          { role: "org_admin", organizationId: ticket.orgId },
          { role: "org_admin" }
        ]
      });

      for (const admin of admins) {
        await Notification.create({
          user: admin._id,
          message: `Student replied to ticket "${ticket.subject}".`,
          type: "info",
          link: "/dashboard/org/student-tickets"
        });
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
export const markStudentTicketAsRead = async (req, res) => {
  try {

    const { ticketId } = req.params;
    const { role } = req.body;

    const ticket = await StudentTicket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    ticket.messages = ticket.messages.map((msg) => {

      if (role === "org_admin" && !msg.readByOrg) {
        msg.readByOrg = true;
      }

      if (role === "student" && !msg.readByStudent) {
        msg.readByStudent = true;
      }

      return msg;
    });

    await ticket.save();

    res.json({ success: true });

  } catch (error) {
    console.error("MARK AS READ ERROR:", error);
    res.status(500).json({ success: false });
  }
};