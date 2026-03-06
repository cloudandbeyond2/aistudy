import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendSupportEmail = async (ticket) => {

const msg = {
    to: process.env.SUPPORT_EMAIL,
    from: process.env.SUPPORT_EMAIL,
    subject: `New Support Ticket: ${ticket.subject}`,
    html: `
        <h3>New Support Ticket</h3>
        <p><strong>Subject:</strong> ${ticket.subject}</p>
        <p><strong>Category:</strong> ${ticket.category}</p>
        <p><strong>Message:</strong></p>
        <p>${ticket.message}</p>
    `
};

await sgMail.send(msg);

};