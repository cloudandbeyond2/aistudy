import express from "express";
import {
  getGlobalNews,
  createGlobalNews,
  deleteGlobalNews
} from "../controllers/globalNewsController.js";

const router = express.Router();

router.get("/", getGlobalNews);
router.post("/", createGlobalNews);
router.delete("/:id", deleteGlobalNews);

export default router;