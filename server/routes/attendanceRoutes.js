import express from "express";
import { markAttendance, getAttendance, getStudentAttendanceSummary, getClassAttendance } from "../controllers/attendanceController.js";

const router = express.Router();

router.post("/mark", markAttendance);
router.get("/check", getAttendance); 
router.get("/summary/:studentId", getStudentAttendanceSummary);
router.get("/class/:classId", getClassAttendance);

export default router;