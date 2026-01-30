import express from 'express';
import {
  createSubscription,
  subscriptionDetails,
  pendingSubscription,
  cancelSubscription
} from '../controllers/razorpay.controller.js';

const router = express.Router();

router.post('/razorpaycreate', createSubscription);
router.post('/razorapydetails', subscriptionDetails);
router.post('/razorapypending', pendingSubscription);
router.post('/razorpaycancel', cancelSubscription);

export default router;
