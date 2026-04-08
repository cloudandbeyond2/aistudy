import sgMail from "@sendgrid/mail";

const sendgridApiKey = process.env.SENDGRID_API_KEY;
const sendgridDisabled = String(process.env.DISABLE_SENDGRID || "").toLowerCase() === "true";
const sendgridEnabled =
  !sendgridDisabled && typeof sendgridApiKey === "string" && sendgridApiKey.startsWith("SG.");

if (sendgridEnabled) {
  sgMail.setApiKey(sendgridApiKey);
}

export const sendSupportEmail = async (ticket) => {

  if (!sendgridEnabled) return;

  const supportEmail = process.env.SUPPORT_EMAIL;
  if (!supportEmail) return;

  const msg = {
    to: supportEmail,
    from: supportEmail,
    subject: `New Support Ticket: ${ticket.subject}`,
    html: `
      <h3>New Support Ticket</h3>
      <p><strong>Subject:</strong> ${ticket.subject}</p>
      <p><strong>Category:</strong> ${ticket.category}</p>
      <p><strong>Message:</strong></p>
      <p>${ticket.message}</p>
    `,
  };

  await sgMail.send(msg);

};
