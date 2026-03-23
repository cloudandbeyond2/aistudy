import OrganizationEnquiry from "../models/OrganizationEnquiry.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

/* CREATE */
export const createOrganizationEnquiry = async (req, res) => {
  try {
    const enquiry = await OrganizationEnquiry.create(req.body);

    /* ADMIN NOTIFICATION */
    try {
      const admins = await User.find({
        $or: [
          { role: "org_admin" },
          { role: "user", isOrganization: false }
        ]
      });

      for (const admin of admins) {
        await Notification.create({
          user: admin._id,
          message: `New organization enquiry from "${enquiry.organizationName}".`,
          type: "info",
          link: "/admin/organization-enquiries",
        });
      }
    } catch (err) {
      console.error("Admin notification for enquiry failed:", err);
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