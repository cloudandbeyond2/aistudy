import express from "express";
import { createAnalytics, getAnalytics } from "../controllers/analytics.controller.js";

const router = express.Router();

router.post("/", createAnalytics);
router.get("/:userId", getAnalytics);

export default router;