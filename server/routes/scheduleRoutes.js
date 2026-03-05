import express from "express";
import {
  createSchedule,
  getSchedules,
  updateSchedule,
  deleteSchedule
} from "../controllers/scheduleController.js";

const router = express.Router();

router.post("/add", createSchedule);

router.get("/", getSchedules);

router.put("/update/:id", updateSchedule);

router.delete("/delete/:id", deleteSchedule);

export default router;