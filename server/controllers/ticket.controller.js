import Ticket from "../models/ticket.model.js";
import mongoose from "mongoose";

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

    const ticket = new Ticket({
      userId,
      subject,
      description,
      slaHours: sla,
      priority,
      status: "Open",
      unreadByAdmin: true,
      unreadByUser: false,
      messages: [
        {
          sender: "user",
          message: description,
        },
      ],
    });

    await ticket.save();

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
    const tickets = await Ticket.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      tickets,
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
    }).sort({ createdAt: -1 });

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

    // ✅ Add message with read tracking
    ticket.messages.push({
      sender,
      message,
      readByAdmin: sender === "admin",
      readByUser: sender === "user",
    });

    // 🔄 STATUS LOGIC
    if (sender === "admin" && ticket.status === "Open") {
      ticket.status = "In Progress";
    }

    if (sender === "user" && ticket.status === "Resolved") {
      ticket.status = "In Progress";
    }

    await ticket.save();

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

    // ✅ Update each message read status
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

    res.json({ success: true });
  } catch (error) {
    console.error("MARK AS READ ERROR:", error);
    res.status(500).json({ success: false });
  }
};