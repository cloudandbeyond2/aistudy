import express from 'express';
import multer from 'multer';
import { uploadSource, chat, generateAction } from '../controllers/notebook.controller.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // Store files in memory buffer for pdf-parse

router.post('/upload-source', upload.single('file'), uploadSource);
router.post('/chat', chat);
router.post('/generate-action', generateAction);

export default router;
