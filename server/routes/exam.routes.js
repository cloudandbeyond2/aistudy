import express from "express";
import {
  updateResult,
  getMyResult,
  getMyResultSimple,
  updateResultSimple,
  sendExamMail,
  getMyResultsBatch,
} from "../controllers/exam.controller.js";

const router = express.Router();

router.post("/updateresult", updateResult);
router.post("/getmyresult", getMyResult);
router.post("/getmyresults-batch", getMyResultsBatch);

// legacy
router.post("/getmyresult-simple", getMyResultSimple);
router.post("/updateresult-simple", updateResultSimple);
router.post("/sendexammail", sendExamMail);

export default router;
