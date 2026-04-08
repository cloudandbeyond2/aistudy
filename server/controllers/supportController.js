import SupportTicket from "../models/SupportTicket.js";
import { sendSupportEmail } from "../config/sendgrid.js";


/* CREATE TICKET */
export const createTicket = async (req, res) => {

try {

const { subject, category, message } = req.body;

const ticket = new SupportTicket({
    subject,
    category,
    message
});

await ticket.save();

/* SEND EMAIL */
try {
  await sendSupportEmail(ticket);
} catch (error) {
  console.warn("Support email send failed (ignored):", error?.message || error);
}

res.status(201).json({
    success: true,
    message: "Ticket submitted successfully",
    ticket
});

} catch (error) {

res.status(500).json({
    success: false,
    message: error.message
});

}
};


/* GET ALL TICKETS */

export const getTickets = async (req, res) => {

try {

const tickets = await SupportTicket.find().sort({ createdAt: -1 });

res.json(tickets);

} catch (error) {

res.status(500).json({ message: error.message });

}
};


/* GET SINGLE TICKET */

export const getTicket = async (req, res) => {

try {

const ticket = await SupportTicket.findById(req.params.id);

res.json(ticket);

} catch (error) {

res.status(500).json({ message: error.message });

}
};


/* UPDATE TICKET */

export const updateTicket = async (req, res) => {

try {

const ticket = await SupportTicket.findByIdAndUpdate(
req.params.id,
req.body,
{ new: true }
);

res.json(ticket);

} catch (error) {

res.status(500).json({ message: error.message });

}
};


/* DELETE TICKET */

export const deleteTicket = async (req, res) => {

try {

await SupportTicket.findByIdAndDelete(req.params.id);

res.json({
message: "Ticket deleted successfully"
});

} catch (error) {

res.status(500).json({ message: error.message });

}
};
