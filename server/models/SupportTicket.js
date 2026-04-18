import mongoose from "mongoose";

const supportTicketSchema = new mongoose.Schema(
{
    subject: {
        type: String,
        required: true
    },
    category: {
        type: String,
        default: "Technical Issue"
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "Open"
    }
},
{ timestamps: true }
);

export default mongoose.model("SupportTicket", supportTicketSchema);
