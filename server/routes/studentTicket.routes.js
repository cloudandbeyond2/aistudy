
import express from "express";
import {
  createStudentTicket,
  getOrgStudentTickets,
  getStudentTickets,
  updateStudentTicketStatus,
  addStudentTicketReply,
  markStudentTicketAsRead,
} from "../controllers/studentTicket.controller.js";
const router = express.Router();

/* ================= CREATE SUPPORT TICKET (Student) ================= */
router.post("/student-tickets", createStudentTicket);

/* ================= GET ALL STUDENT TICKETS (Org Admin) ================= */
router.get("/student-tickets/org/:orgId", getOrgStudentTickets);

/* ================= GET STUDENT'S OWN TICKETS ================= */
router.get("/student-tickets/student/:studentId", getStudentTickets);

/* ================= UPDATE STATUS (Org Admin) ================= */
router.put(
  "/student-tickets/:ticketId/status",
  updateStudentTicketStatus
);

/* ================= ADD REPLY ================= */
router.post(
  "/student-tickets/:ticketId/reply",
  addStudentTicketReply
);

/* ================= MARK AS READ ================= */
router.put(
  "/student-tickets/:ticketId/mark-read",
  markStudentTicketAsRead
);

export default router;