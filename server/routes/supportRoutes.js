import express from "express";
import {
createTicket,
getTickets,
getTicket,
updateTicket,
deleteTicket
} from "../controllers/supportController.js";

const router = express.Router();

/* POST */
router.post("/create", createTicket);

/* GET ALL */
router.get("/", getTickets);

/* GET ONE */
router.get("/:id", getTicket);

/* UPDATE */
router.put("/:id", updateTicket);

/* DELETE */
router.delete("/:id", deleteTicket);

export default router;