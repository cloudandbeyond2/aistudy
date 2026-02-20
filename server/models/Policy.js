import mongoose from "mongoose";

const policySchema = new mongoose.Schema(
  {
    privacy: { type: String, default: "" },
    terms: { type: String, default: "" },
    cookies: { type: String, default: "" },
    refund: { type: String, default: "" },
    cancellation: { type: String, default: "" },          // ✅ ADD
    subscriptionBilling: { type: String, default: "" },   // ✅ ADD
  },
  { timestamps: true }
);

export default mongoose.model("Policy", policySchema);
