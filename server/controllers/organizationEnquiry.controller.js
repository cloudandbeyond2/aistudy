import OrganizationEnquiry from "../models/OrganizationEnquiry.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import Admin from "../models/Admin.js";

/* CREATE */
export const createOrganizationEnquiry = async (req, res) => {
  try {
    const enquiry = await OrganizationEnquiry.create(req.body);

    /* ADMIN NOTIFICATION */
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