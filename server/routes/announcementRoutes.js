import express from "express";
import {
  createAnnouncement,
  getAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcementController.js";

const router = express.Router();


// CREATE
router.post("/create", createAnnouncement);

// GET
router.get("/all", getAnnouncements);

// UPDATE
router.put("/update/:id", updateAnnouncement);

// DELETE
router.delete("/delete/:id", deleteAnnouncement);


export default router;