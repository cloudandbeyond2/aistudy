import express from 'express';
import {
  saveNotes,
  getNotes
} from '../controllers/notes.controller.js';

const router = express.Router();

router.post('/savenotes', saveNotes);
router.post('/getnotes', getNotes);

export default router;
