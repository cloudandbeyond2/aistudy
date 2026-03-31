import OrganizationEnquiry from "../models/OrganizationEnquiry.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import Admin from "../models/Admin.js";
import nodemailer from "nodemailer"; // 1. Add this import
/* CREATE */
export const createOrganizationEnquiry = async (req, res) => {
  try {
    // 1. First, save to Database
    const enquiry = await OrganizationEnquiry.create(req.body);

    // 2. Define mailOptions BEFORE trying to send it
    const mailOptions = {
      from: `"AI Study Enquiry" <${process.env.EMAIL}>`,
      to: "colossusiq@gmail.com", 
      subject: `New Organization Enquiry: ${enquiry.organizationName}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #081323;">New Request Received</h2>
          <p><strong>Organization:</strong> ${enquiry.organizationName}</p>
          <p><strong>Contact Person:</strong> ${enquiry.contactPerson}</p>
          <p><strong>Work Email:</strong> ${enquiry.email}</p>
          <p><strong>Phone:</strong> ${enquiry.phone}</p>
          <p><strong>Team Size:</strong> ${enquiry.teamSize}</p>
          <hr />
          <p><strong>Message:</strong></p>
          <p>${enquiry.message}</p>
        </div>
      `,
    };

    // 3. Setup the Transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, 
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD, 
      },
    });

    // 4. Now send the email
    try {
      console.log("Attempting to send email...");
      const info = await transporter.sendMail(mailOptions);
      console.log("✅ Email sent successfully:", info.messageId);
    } catch (mailErr) {
      console.error("❌ NODEMAILER ERROR:", mailErr.message);
    }

    /* ADMIN NOTIFICATION LOGIC */
    try {
      const mainAdmin = await Admin.findOne({ type: "main" });
      if (mainAdmin) {
        const adminUser = await User.findOne({ email: mainAdmin.email });
        if (adminUser) {
          await Notification.create({
            user: adminUser._id,
            message: `New organization enquiry from "${enquiry.organizationName}".`,
            type: "info",
            link: "/admin/organization-enquiries",
          });
        }
      }
    } catch (err) {
      console.error("Admin notification failed:", err);
    }

    res.status(201).json(enquiry);
  } catch (error) {
    console.error("CREATE ENQUIRY ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* GET ALL */
export const getOrganizationEnquiries = async (req, res) => {
  const enquiries = await OrganizationEnquiry.find().sort({ createdAt: -1 });
  res.json(enquiries);
};

/* UPDATE STATUS + CONTACT METHOD */
export const updateOrganizationEnquiryStatus = async (req, res) => {
  const { status, handledBy } = req.body;

  const enquiry = await OrganizationEnquiry.findByIdAndUpdate(
    req.params.id,
    { status, handledBy },
    { new: true }
  );

  res.json(enquiry);
};