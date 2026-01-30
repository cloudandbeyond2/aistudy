import express from 'express';
import { downloadReceipt } from '../controllers/receipt.controller.js';

const router = express.Router();

router.post('/downloadreceipt', downloadReceipt);

export default router;
