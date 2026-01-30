import express from 'express';
import {
  getPublicTestimonials,
  submitTestimonial,
  getAdminTestimonials,
  updateTestimonial,
  deleteTestimonial
} from '../controllers/testimonial.controller.js';

const router = express.Router();

// Public
router.get('/testimonials', getPublicTestimonials);
router.post('/testimonials/submit', submitTestimonial);

// Admin
router.get('/admin/testimonials', getAdminTestimonials);
router.post('/admin/testimonials/:id/update', updateTestimonial);
router.delete('/admin/testimonials/:id', deleteTestimonial);

export default router;
