import express from 'express';
import { flutterwaveCancel } from '../controllers/flutterwave.controller.js';
import { flutterwaveDetails } from '../controllers/flutterwave.controller.js';

const router = express.Router();

router.post('/flutterwavecancel', flutterwaveCancel);
router.post('/flutterdetails', flutterwaveDetails);

export default router;
