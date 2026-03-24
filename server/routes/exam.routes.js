import express from "express";
import {
  updateResult,
  getMyResult,
  getMyResultSimple,
  updateResultSimple,
  sendExamMail,
  getMyResultsBatch,
  getOrgQuizStatus,
  startOrgQuizAttempt,
  logOrgQuizSecurityEvent,
  abandonOrgQuizAttempt,
  submitOrgQuizAttempt,
  getOrgQuizReports,
  getLegacyQuizRetakeStatus,
  createLegacyQuizRetakeRequest,
  getLegacyQuizRetakeRequests,
  reviewLegacyQuizRetakeRequest,
} from "../controllers/exam.controller.js";

const router = express.Router();

router.post("/updateresult", updateResult);
router.post("/getmyresult", getMyResult);
router.post("/getmyresults-batch", getMyResultsBatch);
router.post("/quiz-retake/status", getLegacyQuizRetakeStatus);
router.post("/quiz-retake/request", createLegacyQuizRetakeRequest);
router.get("/quiz-retake-requests", getLegacyQuizRetakeRequests);
router.post("/quiz-retake-requests/review", reviewLegacyQuizRetakeRequest);
router.post("/org-quiz/status", getOrgQuizStatus);
router.post("/org-quiz/start", startOrgQuizAttempt);
router.post("/org-quiz/security-event", logOrgQuizSecurityEvent);
router.post("/org-quiz/abandon", abandonOrgQuizAttempt);
router.post("/org-quiz/submit", submitOrgQuizAttempt);
router.get("/org-quiz/reports", getOrgQuizReports);

// legacy
router.post("/getmyresult-simple", getMyResultSimple);
router.post("/updateresult-simple", updateResultSimple);
router.post("/sendexammail", sendExamMail);

export default router;
