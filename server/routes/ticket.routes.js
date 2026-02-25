import express from "express";
import {
  createTicket,
  getAllTickets,
  getUserTickets,
  updateTicketStatus,
  addTicketReply   // 👈 ADD THIS
} from "../controllers/ticket.controller.js";
import { markAsRead } from "../controllers/ticket.controller.js";

const router = express.Router();
router.post("/tickets", createTicket);
router.get("/tickets", getAllTickets);
router.get("/tickets/user/:userId", getUserTickets);
router.put("/tickets/:ticketId/status", updateTicketStatus);
router.post("/tickets/:ticketId/reply", addTicketReply); // 👈 NEW
router.put("/tickets/:ticketId/mark-read", markAsRead);


export default router;