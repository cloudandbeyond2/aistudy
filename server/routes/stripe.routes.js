import express from 'express';
import {
  stripePayment,
  stripeDetails,
  stripeCancel
} from '../controllers/stripe.controller.js';

const router = express.Router();

router.post('/stripepayment', stripePayment);
router.post('/stripedetails', stripeDetails);
router.post('/stripecancel', stripeCancel);

export default router;
