import express from 'express';
import {
  getPricingPublic,
  getPricingAdmin,
  updatePricing
} from '../controllers/pricing.controller.js';

const router = express.Router();

// Public
router.get('/pricing', getPricingPublic);

// Admin
router.get('/admin/pricing', getPricingAdmin);
router.post('/admin/pricing/update', updatePricing);

export default router;
