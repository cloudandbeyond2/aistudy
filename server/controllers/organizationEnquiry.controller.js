import OrganizationEnquiry from "../models/OrganizationEnquiry.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import Admin from "../models/Admin.js";
import { sendMail } from "../services/mail.service.js";
import { buildSupportMailTemplate } from "./ticket.controller.js";

/* CREATE */
export const createOrganizationEnquiry = async (req, res) => {
  try {
    const enquiry = await OrganizationEnquiry.create(req.body);

    try {
      await sendMail({
        to: "colossusiq@gmail.com",
        subject: `New Organization Enquiry: ${enquiry.organizationName}`,
        html: buildSupportMailTemplate({
          heading: "New Organization Enquiry",
          title: "New Request Received",
          fields: [
            { label: "Organization", value: enquiry.organizationName },
            { label: "Contact Person", value: enquiry.contactPerson },
            { label: "Work Email", value: enquiry.email },
            { label: "Phone", value: enquiry.phone },
            { label: "Team Size", value: enquiry.teamSize },
          ],
          messageLabel: "Message",
          message: enquiry.message,
        }),
      });
    } catch (mailErr) {
      console.error("NODEMAILER ERROR:", mailErr.message);
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
