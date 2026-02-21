import mongoose from "mongoose";

const organizationEnquirySchema = new mongoose.Schema(
  {
    organizationName: { type: String, required: true },
    contactPerson: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    teamSize: String,
    message: String,

    referBy: {
      type: String,
      required: true,
    },

    handledBy: {          // ✅ NEW FIELD (Admin Name)
      type: String,
      default: null,
    },

    status: {
      type: String,
      default: "new", // new | contacted | closed
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "OrganizationEnquiry",
  organizationEnquirySchema
);