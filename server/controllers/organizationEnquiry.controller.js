import OrganizationEnquiry from "../models/OrganizationEnquiry.js";

/* CREATE */
export const createOrganizationEnquiry = async (req, res) => {
  const enquiry = await OrganizationEnquiry.create(req.body);
  res.status(201).json(enquiry);
};

/* GET ALL */
export const getOrganizationEnquiries = async (req, res) => {
  const enquiries = await OrganizationEnquiry.find().sort({ createdAt: -1 });
  res.json(enquiries);
};

/* UPDATE STATUS */
export const updateOrganizationEnquiryStatus = async (req, res) => {
  const { status } = req.body;

  const enquiry = await OrganizationEnquiry.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  res.json(enquiry);
};
