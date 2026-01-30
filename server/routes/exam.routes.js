import express from "express";
import {
  updateResult,
  getMyResult,
  getMyResultSimple,
  updateResultSimple,
  sendExamMail,
} from "../controllers/exam.controller.js";

const router = express.Router();

router.post("/updateresult", updateResult);
router.post("/getmyresult", getMyResult);

// legacy
router.post("/getmyresult-simple", getMyResultSimple);
router.post("/updateresult-simple", updateResultSimple);
router.post("/sendexammail", sendExamMail);

export default router;
