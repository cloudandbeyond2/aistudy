import express from 'express';
import {
  createPaypalSubscription,
  getPaypalDetails
} from '../controllers/paypal.controller.js';
import {
  paypalWebhook,
  cancelPaypalSubscription,
  updatePaypalPlan
} from '../controllers/paypal.controller.js';

const router = express.Router();

router.post('/paypal', createPaypalSubscription);
router.post('/paypaldetails', getPaypalDetails);
router.post('/paypal/webhook', paypalWebhook);
router.post('/paypal/cancel', cancelPaypalSubscription);
router.post('/paypal/update', updatePaypalPlan);

export default router;
