import express from 'express';
import {
  getSubscriptionDetails,
  sendReceipt
} from '../controllers/subscription.controller.js';

const router = express.Router();

router.post('/subscriptiondetail', getSubscriptionDetails);
router.post('/sendreceipt', sendReceipt);

export default router;
