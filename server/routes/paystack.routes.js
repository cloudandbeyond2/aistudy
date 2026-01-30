import express from 'express';
import {
  paystackPayment,
  paystackFetch,
  paystackCancel
} from '../controllers/paystack.controller.js';

const router = express.Router();

router.post('/paystackpayment', paystackPayment);
router.post('/paystackfetch', paystackFetch);
router.post('/paystackcancel', paystackCancel);

export default router;
