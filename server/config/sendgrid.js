import sgMail from "@sendgrid/mail";

let sg = null;
try {
    if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.startsWith('SG.')) {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        sg = sgMail;
    } else {
        console.warn('SendGrid API key missing or invalid. Email sending disabled.');
    }
} catch (e) {
    console.warn('Failed to initialize SendGrid:', e.message || e);
    sg = null;
}

export const sendSupportEmail = async (ticket) => {
    if (!sg) {
        console.info('sendSupportEmail: Skipped because SendGrid is not configured.');
        return { success: false, message: 'SendGrid not configured' };
    }

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

    try {
        await sg.send(msg);
        return { success: true };
    } catch (err) {
        console.error('sendSupportEmail error:', err.message || err);
        return { success: false, message: err.message || String(err) };
    }
};