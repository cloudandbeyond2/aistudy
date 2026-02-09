import express from "express";
import {
  createOrganizationEnquiry,
  getOrganizationEnquiries,
  updateOrganizationEnquiryStatus,
} from "../controllers/organizationEnquiry.controller.js";

const router = express.Router();

// Public
router.post("/", createOrganizationEnquiry);

// Admin
router.get("/", getOrganizationEnquiries);
router.put("/:id", updateOrganizationEnquiryStatus);

export default router;
