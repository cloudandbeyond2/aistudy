import express from 'express';
import {
  createSubscription,
  subscriptionDetails,
  pendingSubscription,
  cancelSubscription,
  getAllOrders,
  getOrder,
  updateOrderStatus,
  updateOrderManually,
  fixPendingOrders,
  checkOrderStatus,
  updateUserFromOrder
} from '../controllers/razorpay.controller.js';

const router = express.Router();

// Razorpay payment routes
router.post('/razorpaycreate', createSubscription);
router.post('/razorapydetails', subscriptionDetails);
router.post('/razorapypending', pendingSubscription);
router.post('/razorpaycancel', cancelSubscription);

// Order management routes
router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrder);
router.patch('/orders/:id/status', updateOrderStatus);
router.post('/orders/manual-update', updateOrderManually);
router.post('/orders/fix-pending', fixPendingOrders);
router.get('/orders/check/:subscriptionId', checkOrderStatus);
router.post('/orders/update-user', updateUserFromOrder);

export default router;